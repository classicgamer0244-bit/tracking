import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { requireMerchantUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { listShipments } from "@/lib/queries/shipments";
import { ShipmentFilters } from "@/components/shipments/shipment-filters";
import { ShipmentTable } from "@/components/shipments/shipment-table";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { Button } from "@/components/ui/button";
import type { ShipmentStatus } from "@prisma/client";

export default async function MerchantShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireMerchantUser();
  const sp = await searchParams;

  const result = await listShipments(
    {
      search: sp.search,
      status: (sp.status as ShipmentStatus | "ALL") ?? "ALL",
      country: sp.country,
      from: sp.from,
      to: sp.to,
      page: sp.page ? Number(sp.page) : 1,
    },
    user.merchantId,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">Manage every shipment for your business.</p>
        </div>
        {can(user, "shipment:create") && (
          <Button render={<Link href="/merchant/shipments/new" />}>
            <PackagePlus className="h-4 w-4" /> Create shipment
          </Button>
        )}
      </div>

      <ShipmentFilters />

      <ShipmentTable
        shipments={result.items}
        basePath="/merchant/shipments"
        canEdit={can(user, "shipment:edit")}
        canArchive={can(user, "shipment:archive")}
        canDelete={can(user, "shipment:delete")}
      />

      <PaginationBar page={result.page} pageCount={result.pageCount} total={result.total} />
    </div>
  );
}
