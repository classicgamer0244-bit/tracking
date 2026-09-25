import Link from "next/link";
import { Package, MapPin, CalendarClock, Building2, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shipments/copy-button";
import { getPublicShipmentByTrackingNumber } from "@/lib/queries/public-tracking";
import { resolvePosition } from "@/lib/geo/resolve-position";
import { MilestoneStepper } from "@/components/tracking/timeline";
import { ShipmentStatusBadge } from "@/components/tracking/status-badge";
import { ContactMerchantForm } from "@/components/tracking/contact-merchant-form";
import { ShipmentRouteMap } from "@/components/tracking/shipment-route-map";
import { PublicHeader } from "@/components/brand/public-header";

export default async function TrackResultPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;
  const shipment = await getPublicShipmentByTrackingNumber(trackingNumber);

  if (!shipment) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <PublicHeader action={<HeaderAction />} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Package className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Tracking number not found</h1>
          <p className="max-w-md text-muted-foreground">
            We couldn&apos;t find a shipment matching &ldquo;{trackingNumber}&rdquo;. Double-check the
            number and try again.
          </p>
          <Button render={<Link href="/" />}>Try another number</Button>
        </main>
      </div>
    );
  }

  const position = resolvePosition({
    status: shipment.status,
    origin: shipment.origin,
    destination: shipment.destination,
    currentLocation: shipment.currentLocation,
    senderCity: shipment.senderCity,
    senderCountry: shipment.senderCountry,
    recipientCity: shipment.recipientCity,
    recipientCountry: shipment.recipientCountry,
  });

  const merchantName = shipment.merchant.businessName ?? shipment.merchant.merchantCode;
  const estimatedDelivery = shipment.estimatedDelivery
    ? new Date(shipment.estimatedDelivery).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader action={<HeaderAction />} />

      <section className="border-b border-white/10 bg-ink text-ink-foreground">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-foreground/60">Tracking number</p>
              <div className="mt-1 flex items-center gap-1.5">
                <h1 className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                  {shipment.trackingNumber}
                </h1>
                <CopyButton value={shipment.trackingNumber} label="Copy tracking number" />
              </div>
            </div>
            <ShipmentStatusBadge status={shipment.status} className="px-3 py-1 text-sm" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-4">
            <RoutePoint label="From" value={shipment.origin} />
            <div className="flex flex-1 items-center gap-2 px-2 text-gold sm:min-w-[80px]">
              <div className="h-px flex-1 bg-white/15" />
              <Truck className="h-4 w-4 shrink-0" />
              <div className="h-px flex-1 bg-white/15" />
            </div>
            <RoutePoint label="To" value={shipment.destination} align="right" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/10 pt-4 text-sm text-ink-foreground/80">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-gold" />
              Estimated delivery <span className="font-medium text-white">{estimatedDelivery}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gold" />
              Shipped by <span className="font-medium text-white">{merchantName}</span>
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-4 py-8 sm:px-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live location</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentRouteMap
                origin={position.origin}
                destination={position.destination}
                current={position.current}
                isDelivered={shipment.status === "DELIVERED"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipment progress</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneStepper currentStatus={shipment.status} events={shipment.trackingEvents} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipment details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoStat icon={MapPin} label="Current location" value={shipment.currentLocation ?? "—"} />
              <InfoStat icon={Package} label="Shipment type" value={shipment.shipmentType} />
              {shipment.weight != null && <InfoStat icon={Package} label="Weight" value={`${shipment.weight} kg`} />}
              <InfoStat
                icon={MapPin}
                label="Destination region"
                value={`${shipment.recipientCity}, ${shipment.recipientCountry}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Message {merchantName}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactMerchantForm trackingNumber={shipment.trackingNumber} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function RoutePoint({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="text-xs uppercase tracking-wide text-ink-foreground/50">{label}</p>
      <p className="font-heading text-lg font-bold text-white sm:text-xl">{value}</p>
    </div>
  );
}

function InfoStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function HeaderAction() {
  return (
    <Button variant="ghost" render={<Link href="/" />}>
      Track another shipment
    </Button>
  );
}
