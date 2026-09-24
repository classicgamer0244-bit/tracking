import { redirect } from "next/navigation";
import { requireMerchantUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { MerchantSettingsForm } from "@/components/merchants/merchant-settings-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function MerchantSettingsPage() {
  const user = await requireMerchantUser();
  const merchant = await prisma.merchant.findUnique({ where: { id: user.merchantId } });
  if (!merchant) redirect("/merchant/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Business information and account security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business information</CardTitle>
          <CardDescription>
            {can(user, "settings:manage") ? "Visible on your public tracking pages." : "Only owners and managers can edit this."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {can(user, "settings:manage") ? (
            <MerchantSettingsForm
              businessName={merchant.businessName}
              merchantName={merchant.merchantName}
              phone={merchant.phone}
              businessAddress={merchant.businessAddress}
              city={merchant.city}
              country={merchant.country}
              logoUrl={merchant.logoUrl}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{merchant.businessName ?? "Not set"}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
