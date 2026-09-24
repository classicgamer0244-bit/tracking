import "server-only";
import { auth } from "@/auth";
import type { PlatformRole, StaffRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: PlatformRole;
  staffRole: StaffRole | null;
  merchantId: string | null;
  merchantStatus: string | null;
};

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return user;
}

/** Resolves the acting merchant user and guarantees they belong to an active merchant. */
export async function requireMerchantUser(): Promise<SessionUser & { merchantId: string }> {
  const user = await requireUser();
  if (user.role !== "MERCHANT_OWNER" && user.role !== "MERCHANT_STAFF") {
    throw new Error("Forbidden");
  }
  if (!user.merchantId || user.merchantStatus !== "ACTIVE") {
    throw new Error("Forbidden: merchant account is not active");
  }
  return { ...user, merchantId: user.merchantId };
}
