"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createMerchantAction, type CreateMerchantResult } from "@/actions/merchants";

const initialState: CreateMerchantResult = { success: false };

export function CreateMerchantForm() {
  const [state, formAction, pending] = useActionState(createMerchantAction, initialState);

  if (state.success && state.merchant) {
    const { merchant } = state;
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Merchant account created successfully</CardTitle>
          </div>
          <CardDescription>
            Share these credentials with the merchant securely — the password is not shown here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Email" value={merchant.email} />
          <Row label="Merchant ID" value={merchant.merchantCode} />
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Account status</span>
            <Badge>{merchant.status}</Badge>
          </div>
          <div className="flex gap-2 pt-2">
            <Button render={<Link href={`/super-admin/merchants/${merchant.id}`} />}>View merchant</Button>
            <Button variant="outline" render={<Link href="/super-admin/merchants/new" />}>
              Create another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create merchant</CardTitle>
        <CardDescription>
          Only an email and password are needed — the merchant fills in business details themselves later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating..." : "Create merchant"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono font-medium">{value}</span>
    </div>
  );
}
