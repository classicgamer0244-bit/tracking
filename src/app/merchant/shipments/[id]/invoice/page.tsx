import { notFound } from "next/navigation";
import { requireMerchantUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { InvoiceView } from "@/components/shipments/invoice-view";

export default async function MerchantInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireMerchantUser();

  const shipment = await prisma.shipment.findUnique({ where: { id }, select: { merchantId: true } });
  if (!shipment || shipment.merchantId !== user.merchantId) notFound();

  return <InvoiceView shipmentId={id} basePath="/merchant/shipments" />;
}
