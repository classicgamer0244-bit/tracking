import { prisma } from "@/lib/prisma";
import { listShipments } from "@/lib/queries/shipments";
import { ShipmentFilters } from "@/components/shipments/shipment-filters";
import { ShipmentTable } from "@/components/shipments/shipment-table";
import { PaginationBar } from "@/components/ui/pagination-bar";
import type { ShipmentStatus } from "@prisma/client";

export default async function SuperAdminShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const [result, merchants] = await Promise.all([
    listShipments({
      search: sp.search,
      status: (sp.status as ShipmentStatus | "ALL") ?? "ALL",
      country: sp.country,
      merchantId: sp.merchantId,
      from: sp.from,
      to: sp.to,
      page: sp.page ? Number(sp.page) : 1,
    }),
    prisma.merchant.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All shipments</h1>
        <p className="text-muted-foreground">Every shipment across every merchant on the platform.</p>
      </div>

      <ShipmentFilters merchants={merchants} />

      <ShipmentTable
        shipments={result.items}
        basePath="/super-admin/shipments"
        showMerchantColumn
        canEdit
        canArchive
        canDelete
      />

      <PaginationBar page={result.page} pageCount={result.pageCount} total={result.total} />
    </div>
  );
}
