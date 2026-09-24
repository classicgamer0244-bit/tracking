"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireMerchantUser, requireUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { notifyMerchant } from "@/lib/notifications";
import { recordAudit } from "@/lib/audit";
import { contactMerchantSchema, replySchema } from "@/lib/validators/message";
import { listConversations, getConversationDetail } from "@/lib/queries/messages";
import type { ActionResult } from "@/actions/shipments";

export async function getMyConversations(params: { search?: string; status?: "OPEN" | "ARCHIVED" | "ALL" }) {
  const actor = await requireUser();
  const merchantId = actor.role === "SUPER_ADMIN" ? undefined : (actor.merchantId ?? undefined);
  return listConversations({ ...params, merchantId });
}

export async function getConversation(id: string) {
  const actor = await requireUser();
  const conversation = await getConversationDetail(id);
  if (!conversation) return null;
  if (actor.role !== "SUPER_ADMIN" && conversation.merchantId !== actor.merchantId) {
    throw new Error("Forbidden");
  }
  return conversation;
}

export async function contactMerchantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`contact:${ip}`);
  if (!allowed) {
    return { success: false, error: "Too many messages sent. Please try again in a minute." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = contactMerchantSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const shipment = await prisma.shipment.findUnique({ where: { trackingNumber: parsed.data.trackingNumber } });
  if (!shipment) return { success: false, error: "No shipment found for that tracking number." };

  // Customer has no unique constraint (a person can message from multiple names);
  // find-or-create by email+name pair.
  const resolvedCustomer =
    (await prisma.customer.findFirst({
      where: { email: parsed.data.email.toLowerCase(), name: parsed.data.name },
    })) ??
    (await prisma.customer.create({
      data: { email: parsed.data.email.toLowerCase(), name: parsed.data.name },
    }));

  let conversation = await prisma.conversation.findFirst({
    where: { shipmentId: shipment.id, customerId: resolvedCustomer.id, status: "OPEN" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        shipmentId: shipment.id,
        merchantId: shipment.merchantId,
        customerId: resolvedCustomer.id,
      },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "CUSTOMER",
      body: parsed.data.message,
    },
  });

  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });

  await notifyMerchant({
    merchantId: shipment.merchantId,
    type: "NEW_MESSAGE",
    title: `New message about ${shipment.trackingNumber}`,
    body: `${parsed.data.name}: ${parsed.data.message.slice(0, 100)}`,
    entityType: "Conversation",
    entityId: conversation.id,
  });

  revalidatePath("/merchant/messages");
  return { success: true, id: conversation.id };
}

export async function replyToConversationAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "message:reply");

  const raw = Object.fromEntries(formData.entries());
  const parsed = replySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: parsed.data.conversationId } });
  if (!conversation || conversation.merchantId !== actor.merchantId) {
    return { success: false, error: "Conversation not found" };
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "MERCHANT",
      senderUserId: actor.id,
      body: parsed.data.body,
    },
  });

  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "message.replied",
    entityType: "Conversation",
    entityId: conversation.id,
    merchantId: actor.merchantId,
  });

  revalidatePath("/merchant/messages");
  return { success: true, id: conversation.id };
}

export async function markConversationReadAction(conversationId: string): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || conversation.merchantId !== actor.merchantId) {
    return { success: false, error: "Conversation not found" };
  }

  await prisma.message.updateMany({
    where: { conversationId, senderType: "CUSTOMER", readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/merchant/messages");
  return { success: true };
}

export async function setConversationArchivedAction(
  conversationId: string,
  archived: boolean,
): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "message:archive");

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || conversation.merchantId !== actor.merchantId) {
    return { success: false, error: "Conversation not found" };
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: archived ? "ARCHIVED" : "OPEN" },
  });

  revalidatePath("/merchant/messages");
  return { success: true };
}

export async function deleteConversationAction(conversationId: string): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "message:delete");

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || conversation.merchantId !== actor.merchantId) {
    return { success: false, error: "Conversation not found" };
  }

  await prisma.conversation.delete({ where: { id: conversationId } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "message.conversation_deleted",
    entityType: "Conversation",
    entityId: conversationId,
    merchantId: actor.merchantId,
  });

  revalidatePath("/merchant/messages");
  return { success: true };
}

// Re-export for pages that only need a session check without a specific permission.
export async function assertUserSignedIn() {
  return requireUser();
}
