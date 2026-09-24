import { MerchantShell } from "@/components/dashboard/merchant-shell";
import { requireMerchantUser } from "@/lib/session";
import { can } from "@/lib/permissions";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMerchantUser();

  const subtitle =
    user.role === "MERCHANT_OWNER"
      ? "Merchant Owner"
      : user.staffRole
        ? user.staffRole.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        : "Staff";

  return (
    <MerchantShell
      userName={user.name}
      userSubtitle={subtitle}
      canCreateShipment={can(user, "shipment:create")}
      canManageStaff={can(user, "staff:manage")}
    >
      {children}
    </MerchantShell>
  );
}
