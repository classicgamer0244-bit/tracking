import type { ShipmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { SHIPMENT_STATUS_LABELS, SHIPMENT_STATUS_TONE } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function ShipmentStatusBadge({ status, className }: { status: ShipmentStatus; className?: string }) {
  const tone = SHIPMENT_STATUS_TONE[status];
  return <Badge className={cn(toneClasses[tone], className)}>{SHIPMENT_STATUS_LABELS[status]}</Badge>;
}
