"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updatePlatformSettingsAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/actions/shipments";

const initialState: ActionResult = { success: false };

export function PlatformSettingsForm({
  platformName,
  supportEmail,
  logoUrl,
  notificationsEnabled,
}: {
  platformName: string;
  supportEmail: string | null;
  logoUrl: string | null;
  notificationsEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(updatePlatformSettingsAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("Platform settings saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="platformName">Platform name</Label>
        <Input id="platformName" name="platformName" defaultValue={platformName} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="supportEmail">Support email</Label>
        <Input id="supportEmail" name="supportEmail" type="email" defaultValue={supportEmail ?? ""} />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label htmlFor="logoUrl">Platform logo URL</Label>
        <Input id="logoUrl" name="logoUrl" defaultValue={logoUrl ?? ""} placeholder="https://..." />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Switch id="notificationsEnabled" name="notificationsEnabled" defaultChecked={notificationsEnabled} />
        <Label htmlFor="notificationsEnabled">Platform-wide notifications enabled</Label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
