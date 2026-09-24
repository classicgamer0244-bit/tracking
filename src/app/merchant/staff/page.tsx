import { redirect } from "next/navigation";
import { requireMerchantUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { listStaff } from "@/lib/queries/staff";
import { StaffList } from "@/components/staff/staff-list";
import { CreateStaffDialog } from "@/components/staff/create-staff-dialog";
import { Card, CardContent } from "@/components/ui/card";

export default async function StaffPage() {
  const user = await requireMerchantUser();
  if (!can(user, "staff:manage")) redirect("/merchant/dashboard");

  const staff = await listStaff(user.merchantId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">Manage who on your team can access ShipTrack.</p>
        </div>
        <CreateStaffDialog />
      </div>
      <Card>
        <CardContent className="p-0">
          <StaffList staff={staff} />
        </CardContent>
      </Card>
    </div>
  );
}
