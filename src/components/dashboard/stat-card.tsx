import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  trend,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  trend?: { value: string; direction: "up" | "down" | "flat" };
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-ink text-background",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-red-600 text-white",
    info: "bg-primary text-primary-foreground",
  };

  return (
    <Card className="transition-transform hover:-translate-y-0.5">
      <CardContent className="flex items-start gap-3 py-5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-ink", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="font-heading text-2xl font-bold leading-none">{value}</p>
            {trend && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-bold",
                  trend.direction === "up" && "text-emerald-600",
                  trend.direction === "down" && "text-red-600",
                  trend.direction === "flat" && "text-muted-foreground",
                )}
              >
                {trend.direction === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
                {trend.direction === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
                {trend.value}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
