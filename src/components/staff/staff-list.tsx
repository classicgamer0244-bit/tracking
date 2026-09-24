"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { SetPasswordDialog } from "@/components/shared/set-password-dialog";
import { setStaffStatusAction, deleteStaffAction, resetStaffPasswordAction } from "@/actions/staff";
import type { User } from "@prisma/client";

const staffRoleLabels: Record<string, string> = {
  MANAGER: "Manager",
  SHIPMENT_MANAGER: "Shipment Manager",
  CUSTOMER_SUPPORT: "Customer Support",
};

export function StaffList({ staff }: { staff: User[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell>{s.email}</TableCell>
            <TableCell>{s.role === "MERCHANT_OWNER" ? "Owner" : staffRoleLabels[s.staffRole ?? ""] ?? s.staffRole}</TableCell>
            <TableCell>
              <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>{s.status}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              {s.role !== "MERCHANT_OWNER" && (
                <div className="flex items-center justify-end gap-1">
                  <SetPasswordDialog userId={s.id} action={resetStaffPasswordAction} />
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await setStaffStatusAction(s.id, s.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE");
                            toast.success(s.status === "ACTIVE" ? "Staff suspended" : "Staff activated");
                          })
                        }
                      >
                        {s.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await deleteStaffAction(s.id);
                            toast.success("Staff member removed");
                          })
                        }
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
