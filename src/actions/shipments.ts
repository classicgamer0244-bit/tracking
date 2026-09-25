"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchantUser, requireSuperAdmin, requireUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";
import { notifyMerchant } from "@/lib/notifications";
import { generateTrackingNumber, generateReferenceId } from "@/lib/tracking-number";
import { shipmentFormSchema, type ShipmentFormInput } from "@/lib/validators/shipment";
import { SHIPMENT_STATUS_LABELS } from "@/lib/shipment-status";
import type { ShipmentStatus } from "@prisma/client";

function toShipmentData(input: ShipmentFormInput) {
  return {
    shipmentType: input.shipmentType,
    description: input.description,
    quantity: input.quantity,
    weight: input.weight ?? null,
    service: input.service,
    cost: input.cost ?? null,
    currency: input.currency,
    insurance: input.insurance,
    estimatedDelivery: input.estimatedDelivery ? new Date(input.estimatedDelivery) : null,
    origin: input.origin,
    destination: input.destination,
    senderName: input.senderName,
    senderEmail: input.senderEmail || null,
    senderPhone: input.senderPhone || null,
    senderAddress: input.senderAddress,
    senderCity: input.senderCity,
    senderState: input.senderState || null,
    senderCountry: input.senderCountry,
    senderPostal: input.senderPostal || null,
    recipientName: input.recipientName,
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

  const trackingNumber = generateTrackingNumber();
  const referenceId = generateReferenceId();

  const merchant = await prisma.merchant.findUnique({
    where: { id: actor.merchantId },
    select: { businessName: true, merchantCode: true },
  });
  const merchantName = merchant?.businessName ?? merchant?.merchantCode ?? "the merchant";

  // A brand-new shipment has always just been picked up and sent out from the
  // merchant's own facility, so those two early milestones are recorded
  // automatically at creation — only later, real-world scans (in transit,
  // customs, out for delivery, delivered) require an explicit Update status.
  const now = Date.now();
  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber,
      referenceId,
      merchantId: actor.merchantId,
      status: "DEPARTED_FACILITY",
      ...toShipmentData(parsed.data),
      currentLocation: merchantName,
      trackingEvents: {
        create: [
          {
            status: "SHIPMENT_CREATED",
            location: parsed.data.origin,
            description: "Shipment created and label generated.",
            visibility: "PUBLIC",
            createdByUserId: actor.id,
            // Staggered into the past (never the future) so a real status
            // update made moments later still sorts after all three of these
            // in "most recent first" ordering everywhere else in the app.
            occurredAt: new Date(now - 120_000),
          },
          {
            status: "PICKED_UP",
            location: merchantName,
            description: `Picked up by ${merchantName}.`,
            visibility: "PUBLIC",
            createdByUserId: actor.id,
            occurredAt: new Date(now - 60_000),
          },
          {
            status: "DEPARTED_FACILITY",
            location: merchantName,
            description: `Departed ${merchantName} facility.`,
            visibility: "PUBLIC",
            createdByUserId: actor.id,
            occurredAt: new Date(now),
          },
        ],
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
