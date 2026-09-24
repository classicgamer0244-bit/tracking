import { describe, it, expect } from "vitest";
import { isException, statusIndex, statusBucket, SHIPMENT_STATUS_LABELS } from "@/lib/shipment-status";

describe("shipment status helpers", () => {
  it("flags DELAYED, RETURNED and CANCELLED as exceptions", () => {
    expect(isException("DELAYED")).toBe(true);
    expect(isException("RETURNED")).toBe(true);
    expect(isException("CANCELLED")).toBe(true);
    expect(isException("IN_TRANSIT")).toBe(false);
  });

  it("orders statuses so later milestones have a higher index", () => {
    expect(statusIndex("SHIPMENT_CREATED")).toBeLessThan(statusIndex("IN_TRANSIT"));
    expect(statusIndex("IN_TRANSIT")).toBeLessThan(statusIndex("DELIVERED"));
  });

  it("buckets statuses for dashboard summary cards", () => {
    expect(statusBucket("DELIVERED")).toBe("delivered");
    expect(statusBucket("DELAYED")).toBe("delayed");
    expect(statusBucket("CANCELLED")).toBe("cancelled");
    expect(statusBucket("OUT_FOR_DELIVERY")).toBe("outForDelivery");
  });

  it("has a human-readable label for every status", () => {
    for (const label of Object.values(SHIPMENT_STATUS_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toMatch(/_/);
    }
  });
});
