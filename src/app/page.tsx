import Link from "next/link";
import { Search, ShieldCheck, Building2, Package, MessageSquare, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogoMark } from "@/components/brand/logo-mark";
import { RouteStrip } from "@/components/brand/route-strip";
import { HierarchyChain } from "@/components/brand/hierarchy-chain";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 font-heading text-lg font-semibold">
            <LogoMark />
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
        {/* Hero */}
        <section className="px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Multi-tenant shipment tracking
            </span>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Shipment tracking your
              <br />
              merchants will <span className="text-primary">actually trust.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Every merchant gets their own isolated dashboard to create shipments, log tracking
              events, and talk to customers. One Super Admin runs the whole platform.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/track" />}>
                <Search className="h-4 w-4" /> Track a package
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/login" />}>
                Merchant / Admin sign in
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-border bg-card p-8 shadow-sm">
            <p className="mb-6 text-center font-mono text-xs text-muted-foreground">
              Tracking №&nbsp; STK-7F3K9QP2A1
            </p>
            <RouteStrip />
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
            {[
              ["3", "user roles"],
              ["17", "tracking statuses"],
              ["0", "cross-tenant leaks"],
              ["24/7", "public tracking"],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="font-heading text-3xl font-semibold text-primary">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-center font-heading text-3xl font-semibold tracking-tight">
            Everything a logistics team actually needs
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={ShieldCheck}
              title="Isolated by design"
              body="Every merchant's shipments, customers, and messages are strictly isolated — enforced on the server, not just hidden in the UI."
            />
            <FeatureCard
              icon={Building2}
              title="Full platform control"
              body="Super Admins manage merchants, shipments, and settings from one place, with a complete audit trail."
            />
            <FeatureCard
              icon={Package}
              title="Real tracking timelines"
              body="Customers track packages with no login required, with a clear visual milestone timeline."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Built-in messaging"
              body="Customers message merchants right from the tracking page — routed to the right shipment automatically."
            />
            <FeatureCard
              icon={Bell}
              title="Live notifications"
              body="Merchants and admins get notified the moment a shipment is created, updated, or delayed."
            />
            <FeatureCard
              icon={Search}
              title="Search everything"
              body="Find any tracking number, merchant, or customer in seconds — scoped to what you're allowed to see."
            />
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-secondary/30 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-heading text-3xl font-semibold tracking-tight">
              How the pieces fit together
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              A strict chain of custody, from platform control down to the person waiting on their
              package.
            </p>
            <div className="mt-12">
              <HierarchyChain />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-ink text-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5 font-heading text-base font-semibold">
            <LogoMark mono />
            ShipTrack
          </div>
          <p className="text-sm text-background/70">
            Demo multi-tenant shipment tracking platform
          </p>
          <Link href="/track" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Track a shipment <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Card className="shadow-none transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
    </Card>
  );
}
