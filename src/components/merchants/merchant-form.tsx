"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActionResult } from "@/actions/shipments";

const initialState: ActionResult = { success: false };

export type MerchantFormValues = {
  id: string;
  businessName?: string;
  merchantName?: string;
  email?: string;
  phone?: string;
  businessAddress?: string;
  country?: string;
  city?: string;
  status?: string;
  logoUrl?: string;
};

/** Edit-only — merchant creation is just email + password (see CreateMerchantForm). */
export function MerchantForm({
  action,
  defaultValues,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValues: MerchantFormValues;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const dv = defaultValues;

  useEffect(() => {
    if (state.success) {
      toast.success("Merchant updated");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={dv.id} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business details</CardTitle>
          <CardDescription>
            Optional — the merchant can fill these in themselves from Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block">Business name</Label>
            <Input name="businessName" defaultValue={dv.businessName} />
          </div>
          <div>
            <Label className="mb-2 block">Merchant contact name</Label>
            <Input name="merchantName" defaultValue={dv.merchantName} />
          </div>
          <div>
            <Label className="mb-2 block">Email *</Label>
            <Input name="email" type="email" defaultValue={dv.email} required />
          </div>
          <div>
            <Label className="mb-2 block">Phone</Label>
            <Input name="phone" defaultValue={dv.phone} />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Business address</Label>
            <Input name="businessAddress" defaultValue={dv.businessAddress} />
          </div>
          <div>
            <Label className="mb-2 block">Country</Label>
            <Input name="country" defaultValue={dv.country} />
          </div>
          <div>
            <Label className="mb-2 block">City</Label>
            <Input name="city" defaultValue={dv.city} />
          </div>
          <div>
            <Label className="mb-2 block">Logo URL</Label>
            <Input name="logoUrl" defaultValue={dv.logoUrl} placeholder="https://..." />
          </div>
          <div>
            <Label className="mb-2 block">Account status</Label>
            <Select name="status" defaultValue={dv.status ?? "ACTIVE"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="DISABLED">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
