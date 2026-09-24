import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, ShipmentStatus } from "@prisma/client";

export type ShipmentListFilters = {
  search?: string;
  status?: ShipmentStatus | "ALL";
  country?: string;
  merchantId?: string;
  from?: string;
  to?: string;
  archived?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "updatedAt" | "estimatedDelivery";
  sortDir?: "asc" | "desc";
};

export function buildShipmentWhere(filters: ShipmentListFilters, scopedMerchantId?: string): Prisma.ShipmentWhereInput {
  const where: Prisma.ShipmentWhereInput = {};

  if (scopedMerchantId) where.merchantId = scopedMerchantId;
  else if (filters.merchantId) where.merchantId = filters.merchantId;

  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.country) where.recipientCountry = { equals: filters.country, mode: "insensitive" };
  where.archived = filters.archived ?? false;

  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  if (filters.search) {
    const s = filters.search;
    where.OR = [
      { trackingNumber: { contains: s, mode: "insensitive" } },
      { referenceId: { contains: s, mode: "insensitive" } },
      { senderName: { contains: s, mode: "insensitive" } },
      { recipientName: { contains: s, mode: "insensitive" } },
      { recipientEmail: { contains: s, mode: "insensitive" } },
      { destination: { contains: s, mode: "insensitive" } },
      { origin: { contains: s, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listShipments(filters: ShipmentListFilters, scopedMerchantId?: string) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const where = buildShipmentWhere(filters, scopedMerchantId);

  const [items, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: { merchant: { select: { businessName: true, merchantCode: true } } },
      orderBy: { [filters.sortBy ?? "createdAt"]: filters.sortDir ?? "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.shipment.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getShipmentDetail(shipmentId: string) {
  return prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      merchant: true,
      trackingEvents: { orderBy: { occurredAt: "desc" } },
      conversations: {
        include: { customer: true, messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { lastMessageAt: "desc" },
      },
    },
  });
}
