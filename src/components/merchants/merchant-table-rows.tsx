"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { MerchantRowActions } from "@/components/merchants/merchant-row-actions";
import type { MerchantStatus } from "@prisma/client";

type MerchantRow = {
  id: string;
  merchantCode: string;
  businessName: string | null;
  email: string;
  status: MerchantStatus;
  createdAt: Date;
  _count: { shipments: number };
  users: { id: string; lastLoginAt: Date | null }[];
};

export function MerchantTableRows({ items }: { items: MerchantRow[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {items.map((m, i) => {
        const owner = m.users[0];
        return (
          <motion.tr
            key={m.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02, ease: "easeOut" }}
            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
          >
            <TableCell className="font-mono text-xs">
              <Link href={`/super-admin/merchants/${m.id}`} className="font-medium hover:underline">
                {m.merchantCode}
              </Link>
              {m.businessName && <p className="font-sans text-xs text-muted-foreground">{m.businessName}</p>}
            </TableCell>
            <TableCell>{m.email}</TableCell>
            <TableCell>
              <Badge variant={m.status === "ACTIVE" ? "default" : "secondary"}>{m.status}</Badge>
            </TableCell>
            <TableCell>{m._count.shipments}</TableCell>
            <TableCell className="text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-muted-foreground">
              {owner?.lastLoginAt ? new Date(owner.lastLoginAt).toLocaleDateString() : "Never"}
            </TableCell>
            <TableCell>
              <MerchantRowActions merchantId={m.id} ownerUserId={owner?.id ?? null} status={m.status} />
            </TableCell>
          </motion.tr>
        );
      })}
    </>
  );
}
