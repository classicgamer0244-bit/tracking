import Link from "next/link";
import { Package, MapPin, CalendarClock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPublicShipmentByTrackingNumber } from "@/lib/queries/public-tracking";
import { MilestoneStepper, EventHistoryList } from "@/components/tracking/timeline";
import { ShipmentStatusBadge } from "@/components/tracking/status-badge";
import { ContactMerchantForm } from "@/components/tracking/contact-merchant-form";

export default async function TrackResultPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;
  const shipment = await getPublicShipmentByTrackingNumber(trackingNumber);

  if (!shipment) {
    return (
      <div className="flex min-h-screen flex-col">
        <TrackHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Tracking number not found</h1>
          <p className="max-w-md text-muted-foreground">
            We couldn&apos;t find a shipment matching &ldquo;{trackingNumber}&rdquo;. Double-check the
            number and try again.
          </p>
          <Button render={<Link href="/track" />}>Try another number</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <TrackHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Tracking number</p>
            <h1 className="font-mono text-2xl font-bold tracking-tight">{shipment.trackingNumber}</h1>
          </div>
          <ShipmentStatusBadge status={shipment.status} />
        </div>

        <Card className="mb-6">
          <CardContent className="grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoStat icon={MapPin} label="Origin" value={shipment.origin} />
            <InfoStat icon={MapPin} label="Destination" value={shipment.destination} />
            <InfoStat icon={Package} label="Current location" value={shipment.currentLocation ?? "—"} />
            <InfoStat
              icon={CalendarClock}
              label="Estimated delivery"
              value={
                shipment.estimatedDelivery
                  ? new Date(shipment.estimatedDelivery).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"
              }
            />
            <InfoStat icon={Package} label="Shipment type" value={shipment.shipmentType} />
            {shipment.weight != null && <InfoStat icon={Package} label="Weight" value={`${shipment.weight} kg`} />}
            <InfoStat icon={Building2} label="Shipped by" value={shipment.merchant.businessName} />
            <InfoStat icon={MapPin} label="Destination region" value={`${shipment.recipientCity}, ${shipment.recipientCountry}`} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Shipment progress</CardTitle>
          </CardHeader>
          <CardContent>
            <MilestoneStepper currentStatus={shipment.status} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Tracking history</CardTitle>
          </CardHeader>
          <CardContent>
            <EventHistoryList events={shipment.trackingEvents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message {shipment.merchant.businessName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactMerchantForm trackingNumber={shipment.trackingNumber} />
          </CardContent>
        </Card>
      </main>
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
      <Icon className="mt-0.5 h-5 w-5 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function TrackHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Package className="h-5 w-5 text-primary" />
          ShipTrack
        </Link>
        <Button variant="ghost" render={<Link href="/track" />}>
          Track another shipment
        </Button>
      </div>
    </header>
  );
}
