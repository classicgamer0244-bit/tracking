"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { ChevronDown, Trash2 } from "lucide-react";
import { setMerchantStatusAction, deleteMerchantAction } from "@/actions/merchants";
import { useRouter } from "next/navigation";
import type { MerchantStatus } from "@prisma/client";

export function MerchantStatusControl({
  merchantId,
  status,
  showDelete = false,
}: {
  merchantId: string;
  status: MerchantStatus;
  showDelete?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  function setStatus(next: MerchantStatus) {
    startTransition(async () => {
      const res = await setMerchantStatusAction(merchantId, next);
      if (res.success) toast.success(`Merchant marked ${next.toLowerCase()}`);
      else toast.error(res.error ?? "Failed to update status");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" disabled={isPending} />}>
          {status} <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={status === "ACTIVE"} onClick={() => setStatus("ACTIVE")}>
            Activate
          </DropdownMenuItem>
          <DropdownMenuItem disabled={status === "INACTIVE"} onClick={() => setStatus("INACTIVE")}>
            Deactivate
          </DropdownMenuItem>
          <DropdownMenuItem disabled={status === "SUSPENDED"} onClick={() => setStatus("SUSPENDED")}>
            Suspend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDelete && (
        <>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this merchant?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the merchant, all of their shipments, staff accounts,
                  conversations, and history. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await deleteMerchantAction(merchantId);
                      if (res.success) {
                        toast.success("Merchant deleted");
                        router.push("/super-admin/merchants");
                      } else {
                        toast.error(res.error ?? "Failed to delete merchant");
                      }
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
