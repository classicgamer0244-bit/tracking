import { notFound } from "next/navigation";
import Link from "next/link";
import { getMerchantDetail } from "@/lib/queries/merchants";
import { MerchantForm } from "@/components/merchants/merchant-form";
import { MerchantStatusControl } from "@/components/merchants/merchant-status-control";
import { ResetPasswordButton } from "@/components/shared/reset-password-button";
import { ShipmentStatusBadge } from "@/components/tracking/status-badge";
import { updateMerchantAction, resetMerchantPasswordAction } from "@/actions/merchants";
import { SHIPMENT_STATUS_LABELS } from "@/lib/shipment-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMerchantDetail(id);
  if (!data) notFound();

  const { merchant, shipmentsByStatus, recentAuditLogs, recentShipments } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{merchant.businessName}</h1>
            <Badge variant={merchant.status === "ACTIVE" ? "default" : "secondary"}>{merchant.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {merchant.merchantCode} · {merchant.city}, {merchant.country} · Created{" "}
            {new Date(merchant.createdAt).toLocaleDateString()}
          </p>
        </div>
        <MerchantStatusControl merchantId={merchant.id} status={merchant.status} showDelete />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({merchant.users.length})</TabsTrigger>
          <TabsTrigger value="shipments">Shipments ({merchant._count.shipments})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="py-5">
                <p className="text-2xl font-semibold">{merchant._count.shipments}</p>
                <p className="text-sm text-muted-foreground">Total shipments</p>
              </CardContent>
            </Card>
            {shipmentsByStatus.slice(0, 3).map((s) => (
              <Card key={s.status}>
                <CardContent className="py-5">
                  <p className="text-2xl font-semibold">{s._count}</p>
                  <p className="text-sm text-muted-foreground">{SHIPMENT_STATUS_LABELS[s.status]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Row label="Merchant contact" value={merchant.merchantName} />
              <Row label="Email" value={merchant.email} />
              <Row label="Phone" value={merchant.phone} />
              <Row label="Username" value={merchant.username} />
              <Row label="Business address" value={merchant.businessAddress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-40" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchant.users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role === "MERCHANT_OWNER" ? "Owner" : u.staffRole}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === "ACTIVE" ? "default" : "secondary"}>{u.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <ResetPasswordButton userId={u.id} action={resetMerchantPasswordAction} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments">
          <Card>
            <CardContent className="p-0">
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
                  {recentShipments.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/super-admin/shipments/${s.id}`} className="hover:underline">
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
          <div className="mt-2 text-right">
            <Link
              href={`/super-admin/shipments?merchantId=${merchant.id}`}
              className="text-sm text-primary hover:underline"
            >
              View all shipments for this merchant
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAuditLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No activity recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.actorLabel}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <MerchantForm
            mode="edit"
            action={updateMerchantAction}
            defaultValues={{
              id: merchant.id,
              businessName: merchant.businessName,
              merchantName: merchant.merchantName,
              email: merchant.email,
              phone: merchant.phone,
              businessAddress: merchant.businessAddress,
              country: merchant.country,
              city: merchant.city,
              status: merchant.status,
              logoUrl: merchant.logoUrl ?? undefined,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
