"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";

export async function listMerchantsLite() {
  await requireSuperAdmin();
  return prisma.merchant.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, businessName: true, merchantCode: true },
    orderBy: { businessName: "asc" },
  });
}
