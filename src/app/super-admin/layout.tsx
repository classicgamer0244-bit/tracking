import { SuperAdminShell } from "@/components/dashboard/super-admin-shell";
import { requireSuperAdmin } from "@/lib/session";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSuperAdmin();

  return <SuperAdminShell userName={user.name}>{children}</SuperAdminShell>;
}
