import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { listMerchants } from "@/lib/queries/merchants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { MerchantFilters } from "@/components/merchants/merchant-filters";
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
    country: sp.country,
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
              <TableHead>Business</TableHead>
              <TableHead>Merchant code</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Shipments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  <Building2 className="mx-auto mb-2 h-8 w-8" />
                  No merchants match your filters.
                </TableCell>
              </TableRow>
            )}
            {result.items.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <Link href={`/super-admin/merchants/${m.id}`} className="font-medium hover:underline">
                    {m.businessName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{m.merchantCode}</TableCell>
                <TableCell>{m.merchantName}</TableCell>
                <TableCell>
                  {m.city}, {m.country}
                </TableCell>
                <TableCell>{m._count.shipments}</TableCell>
                <TableCell>
                  <Badge variant={m.status === "ACTIVE" ? "default" : "secondary"}>{m.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={result.page} pageCount={result.pageCount} total={result.total} />
    </div>
  );
}
