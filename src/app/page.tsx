import Link from "next/link";
import { Package, Search, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-primary" />
            ShipTrack
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" render={<Link href="/track" />}>
              Track a shipment
            </Button>
            <Button render={<Link href="/login" />}>Sign in</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Multi-tenant shipment tracking, built for logistics teams
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Give every merchant their own isolated dashboard to create shipments, manage tracking
            events, and talk to customers — with a single platform to manage them all.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" render={<Link href="/track" />}>
              <Search className="mr-2 h-4 w-4" /> Track a package
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Merchant / Admin sign in
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Isolated by design</CardTitle>
              <CardDescription>
                Every merchant&apos;s shipments, customers, and messages are strictly isolated from
                every other merchant.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Building2 className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Full platform control</CardTitle>
              <CardDescription>
                Super Admins manage merchants, shipments, and platform settings from one place.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Package className="h-6 w-6 text-primary" />
              <CardTitle className="mt-2">Real tracking timelines</CardTitle>
              <CardDescription>
                Customers track packages with no login required, with a clear visual timeline.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        ShipTrack — demo multi-tenant shipment tracking platform
      </footer>
    </div>
  );
}
