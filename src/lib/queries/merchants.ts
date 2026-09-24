import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, MerchantStatus } from "@prisma/client";

export type MerchantListFilters = {
  search?: string;
  status?: MerchantStatus | "ALL";
  country?: string;
  page?: number;
  pageSize?: number;
};

export async function listMerchants(filters: MerchantListFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const where: Prisma.MerchantWhereInput = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.country) where.country = { equals: filters.country, mode: "insensitive" };
  if (filters.search) {
    where.OR = [
      { businessName: { contains: filters.search, mode: "insensitive" } },
      { merchantName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { merchantCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { shipments: true, users: true } } },
    }),
    prisma.merchant.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getMerchantDetail(id: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "asc" } },
      _count: { select: { shipments: true } },
    },
  });
  if (!merchant) return null;

  const [shipmentsByStatus, recentAuditLogs, recentShipments] = await Promise.all([
    prisma.shipment.groupBy({
      by: ["status"],
      where: { merchantId: id },
      _count: true,
    }),
    prisma.auditLog.findMany({ where: { merchantId: id }, orderBy: { createdAt: "desc" }, take: 15 }),
    prisma.shipment.findMany({ where: { merchantId: id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return { merchant, shipmentsByStatus, recentAuditLogs, recentShipments };
}
