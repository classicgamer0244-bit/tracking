"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchantUser, requireSuperAdmin, requireUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";
import { notifyMerchant } from "@/lib/notifications";
import { generateTrackingNumber } from "@/lib/tracking-number";
import { shipmentFormSchema, trackingEventSchema, type ShipmentFormInput } from "@/lib/validators/shipment";
import { SHIPMENT_STATUS_LABELS } from "@/lib/shipment-status";
import type { ShipmentStatus } from "@prisma/client";

function toShipmentData(input: ShipmentFormInput) {
  return {
    referenceId: input.referenceId || null,
    shipmentType: input.shipmentType,
    description: input.description,
    quantity: input.quantity,
    weight: input.weight ?? null,
    dimensions: input.dimensions || null,
    service: input.service,
    cost: input.cost ?? null,
    insurance: input.insurance,
    estimatedDelivery: input.estimatedDelivery ? new Date(input.estimatedDelivery) : null,
    origin: input.origin,
    destination: input.destination,
    currentLocation: input.currentLocation || input.origin,
    departureLocation: input.departureLocation || null,
    arrivalLocation: input.arrivalLocation || null,
    senderName: input.senderName,
    senderCompany: input.senderCompany || null,
    senderEmail: input.senderEmail || null,
    senderPhone: input.senderPhone || null,
    senderAddress: input.senderAddress,
    senderCity: input.senderCity,
    senderState: input.senderState || null,
    senderCountry: input.senderCountry,
    senderPostal: input.senderPostal || null,
    recipientName: input.recipientName,
    recipientCompany: input.recipientCompany || null,
    recipientEmail: input.recipientEmail || null,
    recipientPhone: input.recipientPhone || null,
    recipientAddress: input.recipientAddress,
    recipientCity: input.recipientCity,
    recipientState: input.recipientState || null,
    recipientCountry: input.recipientCountry,
    recipientPostal: input.recipientPostal || null,
  };
}

export type ActionResult = { success: boolean; error?: string; id?: string };

export async function createShipmentAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "shipment:create");

  const raw = Object.fromEntries(formData.entries());
  const parsed = shipmentFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let trackingNumber = parsed.data.trackingNumber?.trim();
  if (!trackingNumber) {
    trackingNumber = generateTrackingNumber();
  } else {
    const existing = await prisma.shipment.findUnique({ where: { trackingNumber } });
    if (existing) return { success: false, error: "That tracking number is already in use." };
  }

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber,
      merchantId: actor.merchantId,
      status: "SHIPMENT_CREATED",
      ...toShipmentData(parsed.data),
      trackingEvents: {
        create: {
          status: "SHIPMENT_CREATED",
          location: parsed.data.origin,
          description: "Shipment created and label generated.",
          visibility: "PUBLIC",
          createdByUserId: actor.id,
        },
      },
    },
  });

  await notifyMerchant({
    merchantId: actor.merchantId,
    type: "SHIPMENT_CREATED",
    title: "New shipment created",
    body: `Shipment ${shipment.trackingNumber} was created.`,
    entityType: "Shipment",
    entityId: shipment.id,
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "shipment.created",
    entityType: "Shipment",
    entityId: shipment.id,
    merchantId: actor.merchantId,
    newValue: { trackingNumber: shipment.trackingNumber },
  });

  revalidatePath("/merchant/shipments");
  revalidatePath("/merchant/dashboard");
  revalidatePath("/super-admin/shipments");
  return { success: true, id: shipment.id };
}

async function loadShipmentForActor(shipmentId: string) {
  const actor = await requireUser();
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw new Error("Shipment not found");

  if (actor.role !== "SUPER_ADMIN" && shipment.merchantId !== actor.merchantId) {
    throw new Error("Forbidden: shipment belongs to a different merchant");
  }
  return { actor, shipment };
}

export async function updateShipmentAction(
  shipmentId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { actor, shipment } = await loadShipmentForActor(shipmentId);
  if (actor.role !== "SUPER_ADMIN") {
    requirePermission({ role: actor.role, staffRole: actor.staffRole }, "shipment:edit");
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = shipmentFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: toShipmentData(parsed.data),
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "shipment.updated",
    entityType: "Shipment",
    entityId: shipmentId,
    merchantId: shipment.merchantId,
    previousValue: shipment,
    newValue: updated,
  });

  revalidatePath(`/merchant/shipments/${shipmentId}`);
  revalidatePath(`/super-admin/shipments/${shipmentId}`);
  return { success: true, id: shipmentId };
}

export async function updateShipmentStatusAction(input: {
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  description?: string;
}): Promise<ActionResult> {
  const { actor, shipment } = await loadShipmentForActor(input.shipmentId);
  if (actor.role !== "SUPER_ADMIN") {
    requirePermission({ role: actor.role, staffRole: actor.staffRole }, "shipment:updateStatus");
  }

  const [updated] = await prisma.$transaction([
    prisma.shipment.update({
      where: { id: input.shipmentId },
      data: { status: input.status, currentLocation: input.location },
    }),
    prisma.trackingEvent.create({
      data: {
        shipmentId: input.shipmentId,
        status: input.status,
        location: input.location,
        description: input.description || `Status updated to ${SHIPMENT_STATUS_LABELS[input.status]}.`,
        visibility: "PUBLIC",
        createdByUserId: actor.role === "SUPER_ADMIN" ? null : actor.id,
      },
    }),
  ]);

  const notifyType = input.status === "DELIVERED" ? "SHIPMENT_DELIVERED" : input.status === "DELAYED" ? "SHIPMENT_DELAYED" : "SHIPMENT_STATUS_CHANGED";
  await notifyMerchant({
    merchantId: shipment.merchantId,
    type: notifyType,
    title: `Shipment ${shipment.trackingNumber} updated`,
    body: `Status changed to "${SHIPMENT_STATUS_LABELS[input.status]}".`,
    entityType: "Shipment",
    entityId: shipment.id,
  });

  await recordAudit({
    actorUserId: actor.role === "SUPER_ADMIN" ? actor.id : actor.id,
    actorLabel: actor.name,
    action: "shipment.status_changed",
    entityType: "Shipment",
    entityId: input.shipmentId,
    merchantId: shipment.merchantId,
    previousValue: { status: shipment.status },
    newValue: { status: input.status },
  });

  revalidatePath(`/merchant/shipments/${input.shipmentId}`);
  revalidatePath(`/super-admin/shipments/${input.shipmentId}`);
  revalidatePath("/merchant/dashboard");
  return { success: true, id: updated.id };
}

export async function addTrackingEventAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = trackingEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { actor, shipment } = await loadShipmentForActor(parsed.data.shipmentId);
  if (actor.role !== "SUPER_ADMIN") {
    requirePermission({ role: actor.role, staffRole: actor.staffRole }, "shipment:addEvent");
  }

  const occurredAt = new Date(`${parsed.data.date}T${parsed.data.time}`);
  const status = parsed.data.status as ShipmentStatus;

  await prisma.$transaction([
    prisma.trackingEvent.create({
      data: {
        shipmentId: parsed.data.shipmentId,
        status,
        location: parsed.data.location,
        occurredAt,
        description: parsed.data.description,
        internalNote: parsed.data.internalNote || null,
        visibility: parsed.data.visibility,
        createdByUserId: actor.role === "SUPER_ADMIN" ? null : actor.id,
      },
    }),
    prisma.shipment.update({
      where: { id: parsed.data.shipmentId },
      data: { status, currentLocation: parsed.data.location },
    }),
  ]);

  await notifyMerchant({
    merchantId: shipment.merchantId,
    type: "SHIPMENT_STATUS_CHANGED",
    title: `Tracking event added — ${shipment.trackingNumber}`,
    body: parsed.data.description,
    entityType: "Shipment",
    entityId: shipment.id,
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "shipment.tracking_event_added",
    entityType: "TrackingEvent",
    entityId: shipment.id,
    merchantId: shipment.merchantId,
    newValue: parsed.data,
  });

  revalidatePath(`/merchant/shipments/${parsed.data.shipmentId}`);
  revalidatePath(`/super-admin/shipments/${parsed.data.shipmentId}`);
  return { success: true, id: parsed.data.shipmentId };
}

export async function archiveShipmentAction(shipmentId: string, archived: boolean): Promise<ActionResult> {
  const { actor, shipment } = await loadShipmentForActor(shipmentId);
  if (actor.role !== "SUPER_ADMIN") {
    requirePermission({ role: actor.role, staffRole: actor.staffRole }, "shipment:archive");
  }

  await prisma.shipment.update({ where: { id: shipmentId }, data: { archived } });
  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: archived ? "shipment.archived" : "shipment.unarchived",
    entityType: "Shipment",
    entityId: shipmentId,
    merchantId: shipment.merchantId,
  });

  revalidatePath("/merchant/shipments");
  revalidatePath("/super-admin/shipments");
  return { success: true };
}

export async function deleteShipmentAction(shipmentId: string): Promise<ActionResult> {
  const { actor, shipment } = await loadShipmentForActor(shipmentId);
  if (actor.role !== "SUPER_ADMIN") {
    requirePermission({ role: actor.role, staffRole: actor.staffRole }, "shipment:delete");
  }

  await prisma.shipment.delete({ where: { id: shipmentId } });
  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "shipment.deleted",
    entityType: "Shipment",
    entityId: shipmentId,
    merchantId: shipment.merchantId,
    previousValue: { trackingNumber: shipment.trackingNumber },
  });

  revalidatePath("/merchant/shipments");
  revalidatePath("/super-admin/shipments");
  return { success: true };
}

export async function reassignShipmentMerchantAction(
  shipmentId: string,
  newMerchantId: string,
): Promise<ActionResult> {
  const actor = await requireSuperAdmin();
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return { success: false, error: "Shipment not found" };

  const merchant = await prisma.merchant.findUnique({ where: { id: newMerchantId } });
  if (!merchant) return { success: false, error: "Target merchant not found" };

  await prisma.shipment.update({ where: { id: shipmentId }, data: { merchantId: newMerchantId } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "shipment.reassigned",
    entityType: "Shipment",
    entityId: shipmentId,
    previousValue: { merchantId: shipment.merchantId },
    newValue: { merchantId: newMerchantId },
  });

  revalidatePath("/super-admin/shipments");
  return { success: true };
}
