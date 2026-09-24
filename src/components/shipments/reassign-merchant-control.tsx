"use client";

import { useState, useTransition } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { listMerchantsLite } from "@/actions/merchants-lite";
import { reassignShipmentMerchantAction } from "@/actions/shipments";

export function ReassignMerchantControl({
  shipmentId,
  currentMerchantId,
}: {
  shipmentId: string;
  currentMerchantId: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: merchants } = useSWR(open ? "merchants-lite" : null, () => listMerchantsLite());
  const [target, setTarget] = useState(currentMerchantId);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>Reassign merchant</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign shipment to a different merchant</DialogTitle>
        </DialogHeader>
        <Select value={target} onValueChange={(v) => v && setTarget(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select merchant" />
          </SelectTrigger>
          <SelectContent>
            {(merchants ?? []).map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.businessName} ({m.merchantCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            disabled={isPending || target === currentMerchantId}
            onClick={() =>
              startTransition(async () => {
                const res = await reassignShipmentMerchantAction(shipmentId, target);
                if (res.success) {
                  toast.success("Shipment reassigned");
                  setOpen(false);
                } else {
                  toast.error(res.error ?? "Failed to reassign");
                }
              })
            }
          >
            {isPending ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
