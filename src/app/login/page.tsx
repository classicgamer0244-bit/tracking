"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/brand/logo-mark";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { FadeIn } from "@/components/motion/fade-in";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:justify-end sm:px-12">
      <Image
        src={STOCK_IMAGES.fulfillmentCenter}
        alt="Logistics fulfillment center"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-ink/20" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-10 text-white">
        <p className="max-w-sm text-lg font-medium leading-snug">
          Real-time visibility for every shipment, from pickup to final mile.
        </p>
      </div>

      <FadeIn className="relative z-10 w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-heading text-xl font-semibold text-white sm:justify-start">
          <LogoMark />
          ShipTrack
        </Link>

        <div className="rounded-xl border bg-background/95 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Sign in</h1>

          <form action={formAction} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or username</Label>
              <Input id="identifier" name="identifier" required autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {state.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/forgot-password" className="hover:underline">
              Forgot password?
            </Link>
            <Link href="/" className="hover:underline">
              Track a shipment
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
