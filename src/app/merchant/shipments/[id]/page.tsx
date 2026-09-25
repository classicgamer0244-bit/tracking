import { notFound } from "next/navigation";
import { requireMerchantUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ShipmentDetailView } from "@/components/shipments/shipment-detail-view";

export default async function MerchantShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireMerchantUser();

  const shipment = await prisma.shipment.findUnique({ where: { id }, select: { merchantId: true } });
  if (!shipment || shipment.merchantId !== user.merchantId) notFound();

  return (
    <ShipmentDetailView
      shipmentId={id}
      basePath="/merchant/shipments"
      isSuperAdmin={false}
      canEdit={can(user, "shipment:edit")}
      canUpdateStatus={can(user, "shipment:updateStatus")}
    />
  );
}
