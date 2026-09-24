import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getShipmentDetail } from "@/lib/queries/shipments";
import { LogoMark } from "@/components/brand/logo-mark";
import { PrintInvoiceButton } from "@/components/shipments/print-invoice-button";

export async function InvoiceView({ shipmentId, basePath }: { shipmentId: string; basePath: string }) {
  const shipment = await getShipmentDetail(shipmentId);
  if (!shipment) notFound();

  const merchant = shipment.merchant;
  const merchantName = merchant.businessName ?? merchant.merchantCode;
  const invoiceNumber = `INV-${shipment.trackingNumber}`;
  const issuedDate = new Date(shipment.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`${basePath}/${shipment.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shipment
        </Link>
        <PrintInvoiceButton />
      </div>

      <div className="rounded-xl border bg-card p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12 w-12 shrink-0" />
            <div>
              <p className="font-heading text-xl font-bold">ShipTrack</p>
              <p className="text-sm text-muted-foreground">Multi-tenant shipment tracking platform</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="font-heading text-2xl font-bold tracking-tight">INVOICE</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">Issued {issuedDate}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">From</p>
            <p className="mt-1 font-semibold">{merchantName}</p>
            {merchant.businessAddress && <p className="text-sm text-muted-foreground">{merchant.businessAddress}</p>}
            {(merchant.city || merchant.country) && (
              <p className="text-sm text-muted-foreground">
                {[merchant.city, merchant.country].filter(Boolean).join(", ")}
              </p>
            )}
            {merchant.email && <p className="text-sm text-muted-foreground">{merchant.email}</p>}
            {merchant.phone && <p className="text-sm text-muted-foreground">{merchant.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bill to</p>
            <p className="mt-1 font-semibold">{shipment.recipientName}</p>
            {shipment.recipientCompany && <p className="text-sm text-muted-foreground">{shipment.recipientCompany}</p>}
            <p className="text-sm text-muted-foreground">
              {shipment.recipientAddress}, {shipment.recipientCity}
              {shipment.recipientState ? `, ${shipment.recipientState}` : ""}, {shipment.recipientCountry}{" "}
              {shipment.recipientPostal ?? ""}
            </p>
            {shipment.recipientEmail && <p className="text-sm text-muted-foreground">{shipment.recipientEmail}</p>}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Tracking number</p>
            <p className="font-mono font-medium">{shipment.trackingNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Service</p>
            <p className="font-medium">{shipment.service}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Origin</p>
            <p className="font-medium">{shipment.origin}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="font-medium">{shipment.destination}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Weight</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">
                {shipment.description}
                {shipment.insurance && (
                  <span className="block text-xs text-muted-foreground">Includes shipment insurance</span>
                )}
              </td>
              <td className="py-3 text-right">{shipment.quantity}</td>
              <td className="py-3 text-right">{shipment.weight ? `${shipment.weight} kg` : "—"}</td>
              <td className="py-3 text-right font-medium">
                {shipment.cost != null ? `$${shipment.cost.toFixed(2)}` : "—"}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-48 space-y-1 text-sm">
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="font-heading text-lg font-bold">
                {shipment.cost != null ? `$${shipment.cost.toFixed(2)}` : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-4 text-center text-xs text-muted-foreground">
          Thank you for shipping with {merchantName}.
        </div>
      </div>
    </div>
  );
}
