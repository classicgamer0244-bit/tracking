import "server-only";
import { prisma } from "@/lib/prisma";

export async function listStaff(merchantId: string) {
  return prisma.user.findMany({
    where: { merchantId, role: { in: ["MERCHANT_OWNER", "MERCHANT_STAFF"] } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}
