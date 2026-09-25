import type { ShipmentStatus } from "@prisma/client";

export const SHIPMENT_STATUS_ORDER: ShipmentStatus[] = [
  "SHIPMENT_CREATED",
  "ORDER_CONFIRMED",
  "LABEL_CREATED",
  "PICKED_UP",
  "PROCESSING",
  "DEPARTED_FACILITY",
  "IN_TRANSIT",
  "ARRIVED_AT_FACILITY",
  "CUSTOMS_PROCESSING",
  "CUSTOMS_CLEARED",
  "HELD_AT_CUSTOMS",
  "OUT_FOR_DELIVERY",
  "DELIVERY_ATTEMPTED",
  "DELIVERED",
];

/** Terminal / exception statuses shown outside the normal linear timeline. */
export const EXCEPTION_STATUSES: ShipmentStatus[] = ["DELAYED", "RETURNED", "CANCELLED"];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  SHIPMENT_CREATED: "Shipment Created",
  ORDER_CONFIRMED: "Order Confirmed",
  LABEL_CREATED: "Label Created",
  PICKED_UP: "Picked Up",
  PROCESSING: "Processing",
  DEPARTED_FACILITY: "Departed Facility",
  IN_TRANSIT: "In Transit",
  ARRIVED_AT_FACILITY: "Arrived at Facility",
  CUSTOMS_PROCESSING: "Customs Processing",
  CUSTOMS_CLEARED: "Customs Cleared",
  HELD_AT_CUSTOMS: "Held at Customs",
  DELAYED: "Delayed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERY_ATTEMPTED: "Delivery Attempted",
  DELIVERED: "Delivered",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

export type StatusTone = "neutral" | "info" | "warning" | "danger" | "success";

export const SHIPMENT_STATUS_TONE: Record<ShipmentStatus, StatusTone> = {
  SHIPMENT_CREATED: "neutral",
  ORDER_CONFIRMED: "neutral",
  LABEL_CREATED: "neutral",
  PICKED_UP: "info",
  PROCESSING: "info",
  DEPARTED_FACILITY: "info",
  IN_TRANSIT: "info",
  ARRIVED_AT_FACILITY: "info",
  CUSTOMS_PROCESSING: "warning",
  CUSTOMS_CLEARED: "info",
  HELD_AT_CUSTOMS: "warning",
  DELAYED: "warning",
  OUT_FOR_DELIVERY: "info",
  DELIVERY_ATTEMPTED: "warning",
  DELIVERED: "success",
  RETURNED: "danger",
  CANCELLED: "danger",
};

export function statusIndex(status: ShipmentStatus): number {
  return SHIPMENT_STATUS_ORDER.indexOf(status);
}

/** The condensed set of milestones shown on the public/merchant progress stepper. */
export const PROGRESS_MILESTONES: ShipmentStatus[] = [
  "SHIPMENT_CREATED",
  "PICKED_UP",
  "DEPARTED_FACILITY",
  "IN_TRANSIT",
  "CUSTOMS_CLEARED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

/** Maps any granular status onto the nearest milestone at or before it in
 * SHIPMENT_STATUS_ORDER, so every real status update groups under one of
 * the seven progress steps. Returns -1 for exception statuses (the caller
 * decides how to place those, typically under the current active step). */
export function milestoneIndexForStatus(status: ShipmentStatus): number {
  const idx = statusIndex(status);
  if (idx < 0) return -1;
  let milestoneIdx = 0;
  for (let i = 0; i < PROGRESS_MILESTONES.length; i++) {
    if (statusIndex(PROGRESS_MILESTONES[i]) <= idx) milestoneIdx = i;
  }
  return milestoneIdx;
}

export function isException(status: ShipmentStatus): boolean {
  return EXCEPTION_STATUSES.includes(status);
}

/** Buckets used by dashboard summary cards. */
export function statusBucket(status: ShipmentStatus): "active" | "inTransit" | "outForDelivery" | "delivered" | "delayed" | "cancelled" {
  if (status === "DELIVERED") return "delivered";
  if (status === "DELAYED" || status === "HELD_AT_CUSTOMS") return "delayed";
  if (status === "CANCELLED" || status === "RETURNED") return "cancelled";
  if (status === "OUT_FOR_DELIVERY" || status === "DELIVERY_ATTEMPTED") return "outForDelivery";
  if (statusIndex(status) >= 0 && statusIndex(status) <= SHIPMENT_STATUS_ORDER.indexOf("ARRIVED_AT_FACILITY")) {
    return statusIndex(status) >= SHIPMENT_STATUS_ORDER.indexOf("DEPARTED_FACILITY") ? "inTransit" : "active";
  }
  return "inTransit";
}
