"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PublicHeader } from "@/components/brand/public-header";

export default function TrackSearchPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <PublicHeader
        action={
          <Button variant="outline" render={<Link href="/login" />}>
            Merchant / Admin sign in
          </Button>
        }
      />

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        }}
      />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <span className="inline-block -rotate-2 rounded-md border-2 border-ink bg-primary px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-cargo-sm">
              No account needed
            </span>
            <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Track your shipment
            </h1>
            <p className="mt-2 text-muted-foreground">Enter your tracking number below.</p>
          </div>
          <Card className="border-2 border-ink shadow-cargo">
            <CardHeader>
              <CardTitle className="text-base">Tracking number</CardTitle>
              <CardDescription className="font-mono">e.g. STK-7F3K9QP2A1</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (value.trim()) router.push(`/track/${encodeURIComponent(value.trim().toUpperCase())}`);
                }}
                className="flex gap-2"
              >
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter tracking number"
                  className="border-2 border-ink font-mono uppercase"
                />
                <Button type="submit">
                  <Search className="h-4 w-4" />
                  Track
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
