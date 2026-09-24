import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function listConversations(params: {
  merchantId?: string;
  search?: string;
  status?: "OPEN" | "ARCHIVED" | "ALL";
}) {
  const where: Prisma.ConversationWhereInput = {};
  if (params.merchantId) where.merchantId = params.merchantId;
  if (params.status && params.status !== "ALL") where.status = params.status;
  if (params.search) {
    const s = params.search;
    where.OR = [
      { shipment: { trackingNumber: { contains: s, mode: "insensitive" } } },
      { customer: { name: { contains: s, mode: "insensitive" } } },
      { customer: { email: { contains: s, mode: "insensitive" } } },
    ];
  }

  return prisma.conversation.findMany({
    where,
    include: {
      customer: true,
      shipment: { select: { trackingNumber: true, id: true } },
      merchant: { select: { businessName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { senderType: "CUSTOMER", readAt: null } } } },
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

export async function getConversationDetail(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: true,
      shipment: true,
      merchant: { select: { businessName: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { senderUser: { select: { name: true } } } },
    },
  });
}
