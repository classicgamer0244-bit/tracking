import { prisma } from "@/lib/prisma";
import { PlatformSettingsForm } from "@/components/settings/platform-settings-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function SuperAdminSettingsPage() {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform settings</h1>
        <p className="text-muted-foreground">Configure global platform behavior.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Shown across the platform and on public tracking pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformSettingsForm
            platformName={settings?.platformName ?? "ShipTrack"}
            supportEmail={settings?.supportEmail ?? null}
            logoUrl={settings?.logoUrl ?? null}
            notificationsEnabled={settings?.notificationsEnabled ?? true}
          />
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
