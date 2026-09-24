"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { MoreHorizontal, ExternalLink, Archive, ArchiveRestore, Trash2, Pencil, PackageSearch } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CopyButton } from "@/components/shipments/copy-button";
import { ShipmentStatusBadge } from "@/components/tracking/status-badge";
import { archiveShipmentAction, deleteShipmentAction } from "@/actions/shipments";
import type { Shipment, ShipmentStatus } from "@prisma/client";

type Row = Shipment & { merchant?: { businessName: string | null; merchantCode: string } };

export function ShipmentTable({
  shipments,
  basePath,
  showMerchantColumn = false,
  canEdit = false,
  canArchive = false,
  canDelete = false,
}: {
  shipments: Row[];
  basePath: string;
  showMerchantColumn?: boolean;
  canEdit?: boolean;
  canArchive?: boolean;
  canDelete?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  const allSelected = shipments.length > 0 && selected.size === shipments.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(shipments.map((s) => s.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkArchive(archived: boolean) {
    startTransition(async () => {
      await Promise.all(Array.from(selected).map((id) => archiveShipmentAction(id, archived)));
      toast.success(archived ? "Shipments archived" : "Shipments restored");
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-3">
      {canArchive && selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <span>{selected.size} selected</span>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => bulkArchive(true)}>
            <Archive className="h-3.5 w-3.5" /> Archive
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => bulkArchive(false)}>
            <ArchiveRestore className="h-3.5 w-3.5" /> Restore
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {canArchive && (
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
              )}
              <TableHead>Tracking #</TableHead>
              {showMerchantColumn && <TableHead>Merchant</TableHead>}
              <TableHead>Sender</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Est. delivery</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState icon={PackageSearch} title="No shipments match your filters" description="Try adjusting or clearing your search and filters." />
                </TableCell>
              </TableRow>
            )}
            {shipments.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02, ease: "easeOut" }}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                {canArchive && (
                  <TableCell>
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleOne(s.id)} />
                  </TableCell>
                )}
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-1">
                    <Link href={`${basePath}/${s.id}`} className="hover:underline">
                      {s.trackingNumber}
                    </Link>
                    <CopyButton value={s.trackingNumber} label="Copy tracking number" />
                  </div>
                </TableCell>
                {showMerchantColumn && <TableCell>{s.merchant?.businessName ?? "—"}</TableCell>}
                <TableCell>{s.senderName}</TableCell>
                <TableCell>{s.recipientName}</TableCell>
                <TableCell>{s.origin}</TableCell>
                <TableCell>{s.destination}</TableCell>
                <TableCell>
                  <ShipmentStatusBadge status={s.status as ShipmentStatus} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(s.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <RowActions
                    shipment={s}
                    basePath={basePath}
                    canEdit={canEdit}
                    canArchive={canArchive}
                    canDelete={canDelete}
                  />
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RowActions({
  shipment,
  basePath,
  canEdit,
  canArchive,
  canDelete,
}: {
  shipment: Row;
  basePath: string;
  canEdit: boolean;
  canArchive: boolean;
  canDelete: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`${basePath}/${shipment.id}`} />}>View details</DropdownMenuItem>
          {canEdit && (
            <DropdownMenuItem render={<Link href={`${basePath}/${shipment.id}?tab=edit`} />}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem render={<Link href={`/track/${shipment.trackingNumber}`} target="_blank" />}>
            <ExternalLink className="h-3.5 w-3.5" /> View public tracking page
          </DropdownMenuItem>
          {canArchive && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await archiveShipmentAction(shipment.id, !shipment.archived);
                  toast.success(shipment.archived ? "Shipment restored" : "Shipment archived");
                })
              }
            >
              {shipment.archived ? (
                <>
                  <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                </>
              ) : (
                <>
                  <Archive className="h-3.5 w-3.5" /> Archive
                </>
              )}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shipment {shipment.trackingNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the shipment, its tracking history, and associated conversations.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteShipmentAction(shipment.id);
                  toast.success("Shipment deleted");
                  setDeleteOpen(false);
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
