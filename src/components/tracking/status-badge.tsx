import type { ShipmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { SHIPMENT_STATUS_LABELS, SHIPMENT_STATUS_TONE } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  info: "bg-blue-100 text-blue-800 border-transparent dark:bg-blue-950 dark:text-blue-300",
  warning: "bg-amber-100 text-amber-800 border-transparent dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 border-transparent dark:bg-red-950 dark:text-red-300",
  success: "bg-emerald-100 text-emerald-800 border-transparent dark:bg-emerald-950 dark:text-emerald-300",
};

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  const tone = SHIPMENT_STATUS_TONE[status];
  return <Badge className={cn(toneClasses[tone])}>{SHIPMENT_STATUS_LABELS[status]}</Badge>;
}
