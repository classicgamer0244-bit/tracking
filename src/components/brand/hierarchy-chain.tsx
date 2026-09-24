import { ShieldCheck, Building2, Package, User } from "lucide-react";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ShieldCheck,
    title: "Super Admin",
    body: "Creates and controls every merchant on the platform.",
  },
  {
    icon: Building2,
    title: "Merchant",
    body: "Runs an isolated dashboard — their shipments only.",
  },
  {
    icon: Package,
    title: "Shipment",
    body: "Created by the merchant, tracked step by step.",
  },
  {
    icon: User,
    title: "Customer",
    body: "Tracks and messages the merchant — no login needed.",
  },
];

export function HierarchyChain() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="contents">
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-ink bg-card p-5 text-center shadow-cargo-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-heading text-sm font-bold">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.body}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center justify-center py-2 sm:py-0">
                <ArrowRight className="h-5 w-5 rotate-90 text-primary sm:rotate-0" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
