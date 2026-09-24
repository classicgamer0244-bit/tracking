import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { listMerchants } from "@/lib/queries/merchants";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { MerchantFilters } from "@/components/merchants/merchant-filters";
import { MerchantTableRows } from "@/components/merchants/merchant-table-rows";
import { EmptyState } from "@/components/ui/empty-state";
import type { MerchantStatus } from "@prisma/client";

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const result = await listMerchants({
    search: sp.search,
    status: (sp.status as MerchantStatus | "ALL") ?? "ALL",
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Merchants</h1>
          <p className="text-muted-foreground">Every merchant on the platform.</p>
        </div>
        <Button render={<Link href="/super-admin/merchants/new" />}>
          <Plus className="h-4 w-4" /> Create merchant
        </Button>
      </div>

      <MerchantFilters />

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shipments</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState icon={Building2} title="No merchants match your filters" description="Try adjusting or clearing your search and filters." />
                </TableCell>
              </TableRow>
            )}
            <MerchantTableRows items={result.items} />
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={result.page} pageCount={result.pageCount} total={result.total} />
    </div>
  );
}
