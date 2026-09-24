import { vi } from "vitest";
import type { SessionUser } from "@/lib/session";

export const mockSessionState: { user: SessionUser | null } = { user: null };

vi.mock("@/lib/session", () => ({
  requireUser: async () => {
    if (!mockSessionState.user) throw new Error("Unauthorized");
    return mockSessionState.user;
  },
  requireSuperAdmin: async () => {
    if (!mockSessionState.user || mockSessionState.user.role !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
    }
    return mockSessionState.user;
  },
  requireMerchantUser: async () => {
    const user = mockSessionState.user;
    if (!user || (user.role !== "MERCHANT_OWNER" && user.role !== "MERCHANT_STAFF")) {
      throw new Error("Forbidden");
    }
    if (!user.merchantId || user.merchantStatus !== "ACTIVE") {
      throw new Error("Forbidden: merchant account is not active");
    }
    return { ...user, merchantId: user.merchantId };
  },
}));
