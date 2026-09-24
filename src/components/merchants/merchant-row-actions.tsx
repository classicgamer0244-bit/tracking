"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Eye } from "lucide-react";
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
import { SetPasswordDialog } from "@/components/shared/set-password-dialog";
import { setMerchantStatusAction, deleteMerchantAction, resetMerchantPasswordAction } from "@/actions/merchants";
import type { MerchantStatus } from "@prisma/client";

export function MerchantRowActions({
  merchantId,
  ownerUserId,
  status,
}: {
  merchantId: string;
  ownerUserId: string | null;
  status: MerchantStatus;
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
    <div className="flex items-center justify-end gap-1">
      {ownerUserId && <SetPasswordDialog userId={ownerUserId} action={resetMerchantPasswordAction} />}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/super-admin/merchants/${merchantId}`} />}>
            <Eye className="h-3.5 w-3.5" /> View
          </DropdownMenuItem>
          {status !== "ACTIVE" && (
            <DropdownMenuItem disabled={isPending} onClick={() => setStatus("ACTIVE")}>
              Activate
            </DropdownMenuItem>
          )}
          {status !== "SUSPENDED" && (
            <DropdownMenuItem disabled={isPending} onClick={() => setStatus("SUSPENDED")}>
              Suspend
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
                    router.refresh();
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
    </div>
  );
}
