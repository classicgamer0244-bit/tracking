"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthShell } from "@/components/brand/auth-shell";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, { message: null });

  return (
    <AuthShell>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>We&apos;ll generate a reset link for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or username</Label>
              <Input id="identifier" name="identifier" required />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
          {state.message && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-muted-foreground">{state.message}</p>
              {state.resetLink && (
                <p>
                  Demo mode (no email provider configured) — reset link:{" "}
                  <Link href={state.resetLink} className="text-primary underline">
                    {state.resetLink}
                  </Link>
                </p>
              )}
            </div>
          )}
          <div className="mt-4 text-sm">
            <Link href="/login" className="text-muted-foreground hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
