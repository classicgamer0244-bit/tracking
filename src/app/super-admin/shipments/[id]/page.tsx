import { ShipmentDetailView } from "@/components/shipments/shipment-detail-view";
import { requireSuperAdmin } from "@/lib/session";

export default async function SuperAdminShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;

  return (
    <ShipmentDetailView
      shipmentId={id}
      basePath="/super-admin/shipments"
      isSuperAdmin
      canEdit
      canUpdateStatus
      canAddEvent
    />
  );
}
