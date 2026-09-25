import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Printer } from "lucide-react";
import { getShipmentDetail } from "@/lib/queries/shipments";
import { formatMoney } from "@/lib/format";
import { ShipmentStatusBadge } from "@/components/tracking/status-badge";
import { CopyButton } from "@/components/shipments/copy-button";
import { MilestoneStepper, EventHistoryList } from "@/components/tracking/timeline";
import { StatusUpdateControl } from "@/components/shipments/status-update-control";
import { AddTrackingEventForm } from "@/components/shipments/add-tracking-event-form";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import { ReassignMerchantControl } from "@/components/shipments/reassign-merchant-control";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateShipmentAction } from "@/actions/shipments";

export async function ShipmentDetailView({
  shipmentId,
  basePath,
  isSuperAdmin,
  canEdit,
  canUpdateStatus,
  canAddEvent,
}: {
  shipmentId: string;
  basePath: string;
  isSuperAdmin: boolean;
  canEdit: boolean;
  canUpdateStatus: boolean;
  canAddEvent: boolean;
}) {
  const shipment = await getShipmentDetail(shipmentId);
  if (!shipment) notFound();

  const boundUpdate = updateShipmentAction.bind(null, shipment.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Tracking number</p>
          <div className="flex items-center gap-1">
            <h1 className="font-mono text-2xl font-semibold tracking-tight">{shipment.trackingNumber}</h1>
            <CopyButton value={shipment.trackingNumber} label="Copy tracking number" />
          </div>
          {isSuperAdmin && (
            <p className="mt-1 text-sm text-muted-foreground">
              Merchant: <span className="font-medium text-foreground">{shipment.merchant.businessName}</span> (
              {shipment.merchant.merchantCode})
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShipmentStatusBadge status={shipment.status} />
          {shipment.archived && <Badge variant="secondary">Archived</Badge>}
          <Link
            href={`/track/${shipment.trackingNumber}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Public page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`${basePath}/${shipment.id}/invoice`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Printer className="h-3.5 w-3.5" /> Invoice
          </Link>
          {canUpdateStatus && (
            <StatusUpdateControl
              shipmentId={shipment.id}
              currentStatus={shipment.status}
              currentLocation={shipment.currentLocation ?? shipment.origin}
            />
          )}
          {canAddEvent && <AddTrackingEventForm shipmentId={shipment.id} />}
          {isSuperAdmin && <ReassignMerchantControl shipmentId={shipment.id} currentMerchantId={shipment.merchantId} />}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracking">Tracking history</TabsTrigger>
          <TabsTrigger value="messages">Messages ({shipment.conversations.length})</TabsTrigger>
          {canEdit && <TabsTrigger value="edit">Edit</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <InfoCard title="Package">
              <Row label="Type" value={shipment.shipmentType} />
              <Row label="Description" value={shipment.description} />
              <Row label="Quantity" value={String(shipment.quantity)} />
              <Row label="Weight" value={shipment.weight ? `${shipment.weight} kg` : "—"} />
              <Row label="Service" value={shipment.service} />
              <Row label="Cost" value={shipment.cost != null ? formatMoney(shipment.cost, shipment.currency) : "—"} />
              <Row label="Insured" value={shipment.insurance ? "Yes" : "No"} />
              <Row
                label="Est. delivery"
                value={shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : "—"}
              />
            </InfoCard>

            <InfoCard title="Sender">
              <Row label="Name" value={shipment.senderName} />
              <Row label="Email" value={shipment.senderEmail ?? "—"} />
              <Row label="Phone" value={shipment.senderPhone ?? "—"} />
              <Row
                label="Address"
                value={`${shipment.senderAddress}, ${shipment.senderCity}${shipment.senderState ? ", " + shipment.senderState : ""}, ${shipment.senderCountry} ${shipment.senderPostal ?? ""}`}
              />
            </InfoCard>

            <InfoCard title="Recipient">
              <Row label="Name" value={shipment.recipientName} />
              <Row label="Email" value={shipment.recipientEmail ?? "—"} />
              <Row label="Phone" value={shipment.recipientPhone ?? "—"} />
              <Row
                label="Address"
                value={`${shipment.recipientAddress}, ${shipment.recipientCity}${shipment.recipientState ? ", " + shipment.recipientState : ""}, ${shipment.recipientCountry} ${shipment.recipientPostal ?? ""}`}
              />
            </InfoCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Route</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-x-10 gap-y-3">
              <RouteStat label="Origin" value={shipment.origin} />
              <RouteStat label="Destination" value={shipment.destination} />
              <RouteStat label="Current location" value={shipment.currentLocation ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneStepper currentStatus={shipment.status} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Full tracking history <span className="font-normal text-muted-foreground">(includes internal-only events)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventHistoryList
                events={shipment.trackingEvents.map((e) => ({
                  id: e.id,
                  status: e.status,
                  location: e.location + (e.visibility === "INTERNAL" ? " (internal only)" : ""),
                  occurredAt: e.occurredAt,
                  description: e.description + (e.internalNote ? ` — Note: ${e.internalNote}` : ""),
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {shipment.conversations.length === 0 && (
            <p className="text-sm text-muted-foreground">No customer messages for this shipment yet.</p>
          )}
          {shipment.conversations.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {c.customer.name} <span className="font-normal text-muted-foreground">({c.customer.email})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {c.messages.map((m) => (
                  <div key={m.id} className={m.senderType === "MERCHANT" ? "text-right" : ""}>
                    <p
                      className={
                        "inline-block max-w-md rounded-lg px-3 py-2 text-sm " +
                        (m.senderType === "MERCHANT" ? "bg-primary text-primary-foreground" : "bg-muted")
                      }
                    >
                      {m.body}
                    </p>
                  </div>
                ))}
                <Link href={`${basePath === "/merchant/shipments" ? "/merchant" : "/super-admin"}/messages?conversation=${c.id}`} className="text-sm text-primary hover:underline">
                  Open in Messages
                </Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {canEdit && (
          <TabsContent value="edit">
            <ShipmentForm
              mode="edit"
              action={boundUpdate}
              defaultValues={{
                shipmentType: shipment.shipmentType,
                description: shipment.description,
                quantity: shipment.quantity,
                weight: shipment.weight ?? undefined,
                dimensions: shipment.dimensions ?? undefined,
                service: shipment.service,
                cost: shipment.cost ?? undefined,
                currency: shipment.currency,
                insurance: shipment.insurance,
                estimatedDelivery: shipment.estimatedDelivery
                  ? new Date(shipment.estimatedDelivery).toISOString().slice(0, 10)
                  : undefined,
                origin: shipment.origin,
                destination: shipment.destination,
                currentLocation: shipment.currentLocation ?? undefined,
                departureLocation: shipment.departureLocation ?? undefined,
                arrivalLocation: shipment.arrivalLocation ?? undefined,
                senderName: shipment.senderName,
                senderCompany: shipment.senderCompany ?? undefined,
                senderEmail: shipment.senderEmail ?? undefined,
                senderPhone: shipment.senderPhone ?? undefined,
                senderAddress: shipment.senderAddress,
                senderCity: shipment.senderCity,
                senderState: shipment.senderState ?? undefined,
                senderCountry: shipment.senderCountry,
                senderPostal: shipment.senderPostal ?? undefined,
                recipientName: shipment.recipientName,
                recipientCompany: shipment.recipientCompany ?? undefined,
                recipientEmail: shipment.recipientEmail ?? undefined,
                recipientPhone: shipment.recipientPhone ?? undefined,
                recipientAddress: shipment.recipientAddress,
                recipientCity: shipment.recipientCity,
                recipientState: shipment.recipientState ?? undefined,
                recipientCountry: shipment.recipientCountry,
                recipientPostal: shipment.recipientPostal ?? undefined,
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function RouteStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
