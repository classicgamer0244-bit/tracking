"use client";

import { Check, Circle, AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ShipmentStatus } from "@prisma/client";
import {
  SHIPMENT_STATUS_LABELS,
  isException,
  PROGRESS_MILESTONES,
  milestoneIndexForStatus,
} from "@/lib/shipment-status";
import { cn } from "@/lib/utils";

export type TimelineEvent = {
  id: string;
  status: ShipmentStatus;
  location: string;
  occurredAt: Date | string;
  description: string;
};

/** Groups events under the milestone their own status maps to — independent
 * of when they were recorded, so one backdated or out-of-order event can't
 * drag every later event into the wrong bucket. Exception statuses (no fixed
 * position in the order) fall back to bucket 0. */
function bucketEventsByMilestone(events: TimelineEvent[]): TimelineEvent[][] {
  const buckets: TimelineEvent[][] = PROGRESS_MILESTONES.map(() => []);
  for (const event of events) {
    const milestoneIdx = Math.max(0, milestoneIndexForStatus(event.status));
    buckets[milestoneIdx].push(event);
  }
  for (const bucket of buckets) {
    bucket.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  }
  return buckets;
}

function formatEventTime(value: Date | string) {
  const date = new Date(value);
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function MilestoneStepper({
  currentStatus,
  events = [],
}: {
  currentStatus: ShipmentStatus;
  events?: TimelineEvent[];
}) {
  const reduceMotion = useReducedMotion();

  if (isException(currentStatus)) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          This shipment is currently marked <strong>{SHIPMENT_STATUS_LABELS[currentStatus]}</strong>.
        </p>
      </div>
    );
  }

  const milestones = PROGRESS_MILESTONES;
  const buckets = bucketEventsByMilestone(events);
  const currentMilestoneIdx = Math.max(0, milestoneIndexForStatus(currentStatus));

  return (
    <div className="flex flex-col">
      {milestones.map((status, i) => {
        // A milestone is only checked off once an actual Update status call
        // recorded an event for it — no inferring it from later progress, so
        // a skipped step (e.g. no explicit "Picked Up") stays pending even
        // after the shipment has moved further along.
        const done = buckets[i].length > 0;
        const lineAfterDone = i === milestones.length - 1 ? false : done;
        const isCurrent = i === currentMilestoneIdx;
        const isLast = i === milestones.length - 1;
        const stepEvents = done ? buckets[i].slice().reverse() : [];
        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                {isCurrent && !reduceMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <div
                  className={cn(
                    "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                    done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2 w-2 fill-current" />}
                </div>
              </div>
              {!isLast && (
                <div className="relative w-0.5 flex-1 min-h-8 overflow-hidden bg-border">
                  <motion.div
                    className="absolute inset-x-0 top-0 bg-primary"
                    initial={false}
                    animate={{ height: lineAfterDone ? "100%" : "0%" }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
            <div className={cn("min-w-0 flex-1 pb-8", isLast && "pb-0")}>
              <span className={cn("pt-1 text-sm", done ? "font-medium text-foreground" : "text-muted-foreground")}>
                {SHIPMENT_STATUS_LABELS[status]}
              </span>
              {stepEvents.length > 0 && (
                <ul className="mt-2 space-y-2 border-l border-border pl-4">
                  {stepEvents.map((event) => (
                    <li key={event.id} className="text-xs">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="font-medium text-foreground">{event.location}</span>
                        <time className="shrink-0 text-muted-foreground">{formatEventTime(event.occurredAt)}</time>
                      </div>
                      <p className="text-muted-foreground">{event.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EventHistoryList({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No tracking events yet.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l pl-6">
      {events.map((event, i) => {
        const date = new Date(event.occurredAt);
        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                "absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-background",
                i === 0 ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-medium">{SHIPMENT_STATUS_LABELS[event.status]}</p>
              <time className="text-xs text-muted-foreground">
                {date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} ·{" "}
                {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </time>
            </div>
            <p className="text-sm text-muted-foreground">{event.location}</p>
            <p className="mt-1 text-sm">{event.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
