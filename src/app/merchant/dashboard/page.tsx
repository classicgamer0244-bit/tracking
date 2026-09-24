import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Activity,
} from "lucide-react";
import { requireMerchantUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getMerchantDashboard } from "@/lib/queries/dashboard";
import { ProfileIncompleteBanner } from "@/components/merchants/profile-incomplete-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { LiveShipmentsMap } from "@/components/dashboard/live-shipments-map";
import { ShipmentStatusBadge } from "@/components/tracking/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/ui/empty-state";

export default async function MerchantDashboardPage() {
  const user = await requireMerchantUser();
  const [stats, merchant] = await Promise.all([
    getMerchantDashboard(user.merchantId),
    prisma.merchant.findUnique({ where: { id: user.merchantId }, select: { businessName: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}.</p>
      </div>

      {!merchant?.businessName && <ProfileIncompleteBanner />}

      <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard label="Total shipments" value={stats.total} icon={Package} tone="neutral" trend={stats.shipmentsTrend} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="In transit" value={stats.inTransit} icon={Truck} tone="info" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} tone="success" trend={stats.deliveredTrend} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Unread messages" value={stats.unreadMessages} icon={MessageSquare} tone="info" />
        </StaggerItem>
      </StaggerGroup>
      <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard label="Active" value={stats.active} icon={Activity} tone="info" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Out for delivery" value={stats.outForDelivery} icon={Clock} tone="warning" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Delayed" value={stats.delayed} icon={AlertTriangle} tone="warning" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Cancelled / returned" value={stats.cancelled} icon={XCircle} tone="danger" />
        </StaggerItem>
      </StaggerGroup>

      <LiveShipmentsMap basePath="/merchant/shipments" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Shipment activity (last 14 days)</CardTitle>
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
            <Button render={<Link href="/merchant/shipments/new" />}>Create shipment</Button>
            <Button variant="outline" render={<Link href="/merchant/shipments" />}>
              Manage shipments
            </Button>
            <Button variant="outline" render={<Link href="/merchant/messages" />}>
              View messages
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent shipments</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/merchant/shipments" />}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentShipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Package}
                      title="No shipments yet"
                      description="Create your first shipment to start tracking deliveries."
                      action={
                        <Button size="sm" render={<Link href="/merchant/shipments/new" />}>
                          Create shipment
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
              {stats.recentShipments.map((s) => (
                <TableRow key={s.id} className="cursor-pointer">
                  <TableCell className="font-mono text-xs">
                    <Link href={`/merchant/shipments/${s.id}`} className="hover:underline">
                      {s.trackingNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{s.recipientName}</TableCell>
                  <TableCell>{s.destination}</TableCell>
                  <TableCell>
                    <ShipmentStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
