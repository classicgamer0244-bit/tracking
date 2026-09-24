"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TrackSearchPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-primary" />
            ShipTrack
          </Link>
          <Button variant="outline" render={<Link href="/login" />}>
            Merchant / Admin sign in
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Track your shipment</h1>
            <p className="mt-2 text-muted-foreground">Enter your tracking number below — no account needed.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tracking number</CardTitle>
              <CardDescription>e.g. STK-7F3K9QP2A1</CardDescription>
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
                  className="uppercase"
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
