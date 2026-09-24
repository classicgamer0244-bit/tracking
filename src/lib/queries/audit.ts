import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function listAuditLogs(params: {
  search?: string;
  merchantId?: string;
  entityType?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 30;

  const where: Prisma.AuditLogWhereInput = {};
  if (params.merchantId) where.merchantId = params.merchantId;
  if (params.entityType) where.entityType = params.entityType;
  if (params.search) {
    where.OR = [
      { action: { contains: params.search, mode: "insensitive" } },
      { actorLabel: { contains: params.search, mode: "insensitive" } },
      { entityId: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { merchant: { select: { businessName: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}
