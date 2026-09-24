import Link from "next/link";
import Image from "next/image";
import { Search, ShieldCheck, Building2, Package, MessageSquare, Bell, ArrowRight, Globe2, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogoMark } from "@/components/brand/logo-mark";
import { RouteStrip } from "@/components/brand/route-strip";
import { HierarchyChain } from "@/components/brand/hierarchy-chain";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { StaggerGroup, StaggerItem, FadeIn } from "@/components/motion/fade-in";

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
          <FadeIn className="mx-auto max-w-4xl text-center">
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
          </FadeIn>

          <FadeIn delay={0.1} className="mx-auto mt-16 max-w-4xl rounded-2xl border border-border bg-card p-8 shadow-sm">
            <p className="mb-6 text-center font-mono text-xs text-muted-foreground">
              Tracking №&nbsp; STK-7F3K9QP2A1
            </p>
            <RouteStrip />
          </FadeIn>
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
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-3">
            <StaggerItem>
              <FeatureCard
                icon={ShieldCheck}
                title="Isolated by design"
                body="Every merchant's shipments, customers, and messages are strictly isolated — enforced on the server, not just hidden in the UI."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={Building2}
                title="Full platform control"
                body="Super Admins manage merchants, shipments, and settings from one place, with a complete audit trail."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={Package}
                title="Real tracking timelines"
                body="Customers track packages with no login required, with a clear visual milestone timeline."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={MessageSquare}
                title="Built-in messaging"
                body="Customers message merchants right from the tracking page — routed to the right shipment automatically."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={Bell}
                title="Live notifications"
                body="Merchants and admins get notified the moment a shipment is created, updated, or delayed."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard
                icon={Search}
                title="Search everything"
                body="Find any tracking number, merchant, or customer in seconds — scoped to what you're allowed to see."
              />
            </StaggerItem>
          </StaggerGroup>
        </section>

        {/* Imagery services */}
        <section className="border-t border-border bg-secondary/30 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-heading text-3xl font-semibold tracking-tight">
              Built for every step of the journey
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              From the port to the porch, every handoff is logged, visible, and searchable.
            </p>
            <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <StaggerItem>
                <ServiceImageCard
                  src={STOCK_IMAGES.containerPort}
                  icon={Globe2}
                  title="Global shipping"
                  alt="Cargo containers at a shipping port"
                />
              </StaggerItem>
              <StaggerItem>
                <ServiceImageCard
                  src={STOCK_IMAGES.sortingFacility}
                  icon={Package}
                  title="Real-time tracking"
                  alt="Packages moving through a sorting facility"
                />
              </StaggerItem>
              <StaggerItem>
                <ServiceImageCard
                  src={STOCK_IMAGES.deliveryTruck}
                  icon={Truck}
                  title="Secure delivery"
                  alt="Delivery truck on the road"
                />
              </StaggerItem>
              <StaggerItem>
                <ServiceImageCard
                  src={STOCK_IMAGES.warehouse}
                  icon={Building2}
                  title="Merchant management"
                  alt="Warehouse shelving with inventory"
                />
              </StaggerItem>
              <StaggerItem>
                <ServiceImageCard
                  src={STOCK_IMAGES.fulfillmentCenter}
                  icon={Users}
                  title="Customer support"
                  alt="Fulfillment center staff at work"
                />
              </StaggerItem>
            </StaggerGroup>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border px-6 py-24">
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

function ServiceImageCard({
  src,
  icon: Icon,
  title,
  alt,
}: {
  src: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  alt: string;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4 text-white">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
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
