"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateMerchantSettingsAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/actions/shipments";

const initialState: ActionResult = { success: false };

export function MerchantSettingsForm({
  businessName,
  merchantName,
  phone,
  businessAddress,
  city,
  country,
  logoUrl,
  onSaved,
}: {
  businessName: string | null;
  merchantName: string | null;
  phone: string | null;
  businessAddress: string | null;
  city: string | null;
  country: string | null;
  logoUrl: string | null;
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateMerchantSettingsAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved");
      onSaved?.();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business name</Label>
        <Input id="businessName" name="businessName" defaultValue={businessName ?? ""} placeholder="Acme Logistics" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="merchantName">Contact name</Label>
        <Input id="merchantName" name="merchantName" defaultValue={merchantName ?? ""} placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={phone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" defaultValue={logoUrl ?? ""} placeholder="https://..." />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Label htmlFor="businessAddress">Business address</Label>
        <Input id="businessAddress" name="businessAddress" defaultValue={businessAddress ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" defaultValue={city ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" defaultValue={country ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
