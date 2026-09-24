import type { ShipmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { SHIPMENT_STATUS_LABELS, SHIPMENT_STATUS_TONE } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-foreground/20",
  info: "bg-blue-100 text-blue-800 border-blue-800/25 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-300/25",
  warning: "bg-amber-100 text-amber-900 border-amber-900/25 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-300/25",
  danger: "bg-red-100 text-red-800 border-red-800/25 dark:bg-red-950 dark:text-red-300 dark:border-red-300/25",
  success: "bg-emerald-100 text-emerald-900 border-emerald-900/25 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-300/25",
};

export function ShipmentStatusBadge({ status, className }: { status: ShipmentStatus; className?: string }) {
  const tone = SHIPMENT_STATUS_TONE[status];
  return <Badge className={cn(toneClasses[tone], className)}>{SHIPMENT_STATUS_LABELS[status]}</Badge>;
}
