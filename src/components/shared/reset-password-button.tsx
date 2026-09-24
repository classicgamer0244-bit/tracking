"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyRound, Copy } from "lucide-react";

export function ResetPasswordButton({
  userId,
  action,
}: {
  userId: string;
  action: (userId: string) => Promise<{ success: boolean; error?: string; tempPassword?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await action(userId);
            if (res.success && res.tempPassword) setTempPassword(res.tempPassword);
            else toast.error(res.error ?? "Failed to reset password");
          })
        }
      >
        <KeyRound className="h-3.5 w-3.5" /> Reset password
      </Button>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary password generated</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Share this password with the user through a secure channel. They should change it after
            signing in.
          </p>
          <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
            {tempPassword}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              onClick={() => tempPassword && navigator.clipboard.writeText(tempPassword)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
