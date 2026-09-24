import Link from "next/link";
import { Building2, Package, Truck, CheckCircle2, AlertTriangle, MessageSquare, CalendarDays } from "lucide-react";
import { getSuperAdminDashboard } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { LiveShipmentsMap } from "@/components/dashboard/live-shipments-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SuperAdminDashboardPage() {
  const stats = await getSuperAdminDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Platform overview</h1>
        <p className="text-muted-foreground">Everything happening across ShipTrack.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total merchants" value={stats.totalMerchants} icon={Building2} tone="neutral" trend={stats.merchantsTrend} />
        <StatCard label="Active merchants" value={stats.activeMerchants} icon={Building2} tone="success" />
        <StatCard label="Total shipments" value={stats.totalShipments} icon={Package} tone="neutral" trend={stats.shipmentsTrend} />
        <StatCard label="Shipments today" value={stats.shipmentsToday} icon={CalendarDays} tone="info" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="In transit" value={stats.inTransit} icon={Truck} tone="info" />
        <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} tone="success" />
        <StatCard label="Delayed" value={stats.delayed} icon={AlertTriangle} tone="warning" />
        <StatCard label="Total messages" value={stats.totalMessages} icon={MessageSquare} tone="info" />
      </div>

      <LiveShipmentsMap basePath="/super-admin/shipments" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Platform-wide shipment activity (last 14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.trend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button render={<Link href="/super-admin/merchants/new" />}>Create merchant</Button>
            <Button variant="outline" render={<Link href="/super-admin/shipments" />}>
              Global shipments
            </Button>
            <Button variant="outline" render={<Link href="/super-admin/audit-logs" />}>
              Audit logs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recently added merchants</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/super-admin/merchants" />}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Merchant code</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentMerchants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No merchants yet.{" "}
                    <Link href="/super-admin/merchants/new" className="text-primary underline">
                      Create the first one
                    </Link>
                    .
                  </TableCell>
                </TableRow>
              )}
              {stats.recentMerchants.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Link href={`/super-admin/merchants/${m.id}`} className="font-medium hover:underline">
                      {m.businessName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.merchantCode}</TableCell>
                  <TableCell>{m.country}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "ACTIVE" ? "default" : "secondary"}>{m.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
