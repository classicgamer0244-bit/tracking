import { listAuditLogs } from "@/lib/queries/audit";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { AuditLogFilters } from "@/components/audit/audit-log-filters";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const result = await listAuditLogs({
    search: sp.search,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit logs</h1>
        <p className="text-muted-foreground">A record of sensitive actions taken across the platform.</p>
      </div>

      <AuditLogFilters />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No audit log entries found.
                  </TableCell>
                </TableRow>
              )}
              {result.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.entityType}
                    {log.entityId ? ` #${log.entityId.slice(-6)}` : ""}
                  </TableCell>
                  <TableCell>{log.actorLabel}</TableCell>
                  <TableCell>{log.merchant?.businessName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaginationBar page={result.page} pageCount={result.pageCount} total={result.total} />
    </div>
  );
}
