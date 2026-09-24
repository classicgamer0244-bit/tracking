"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { updateShipmentStatusAction } from "@/actions/shipments";
import { SHIPMENT_STATUS_LABELS } from "@/lib/shipment-status";
import type { ShipmentStatus } from "@prisma/client";

export function StatusUpdateControl({
  shipmentId,
  currentStatus,
  currentLocation,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
  currentLocation: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ShipmentStatus>(currentStatus);
  const [location, setLocation] = useState(currentLocation);
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>Update status</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update shipment status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>New status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Shown on the public tracking timeline" />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await updateShipmentStatusAction({ shipmentId, status, location, description });
                if (res.success) {
                  toast.success("Status updated");
                  setOpen(false);
                } else {
                  toast.error(res.error ?? "Failed to update status");
                }
              })
            }
          >
            {isPending ? "Updating..." : "Update status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
