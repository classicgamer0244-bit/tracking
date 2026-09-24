import { describe, it, expect } from "vitest";
import { can, requirePermission } from "@/lib/permissions";

describe("permission matrix", () => {
  it("grants Super Admin every merchant action", () => {
    expect(can({ role: "SUPER_ADMIN", staffRole: null }, "shipment:delete")).toBe(true);
    expect(can({ role: "SUPER_ADMIN", staffRole: null }, "staff:manage")).toBe(true);
  });

  it("grants Merchant Owner full shipment and settings control, but not staff management", () => {
    const owner = { role: "MERCHANT_OWNER" as const, staffRole: null };
    expect(can(owner, "shipment:create")).toBe(true);
    expect(can(owner, "shipment:delete")).toBe(true);
    expect(can(owner, "staff:manage")).toBe(false);
    expect(can(owner, "settings:manage")).toBe(true);
  });

  it("lets a Shipment Manager create and edit shipments but not manage staff", () => {
    const shipmentManager = { role: "MERCHANT_STAFF" as const, staffRole: "SHIPMENT_MANAGER" as const };
    expect(can(shipmentManager, "shipment:create")).toBe(true);
    expect(can(shipmentManager, "shipment:edit")).toBe(true);
    expect(can(shipmentManager, "staff:manage")).toBe(false);
    expect(can(shipmentManager, "message:reply")).toBe(false);
  });

  it("lets Customer Support view shipments and reply to messages but never create shipments", () => {
    const support = { role: "MERCHANT_STAFF" as const, staffRole: "CUSTOMER_SUPPORT" as const };
    expect(can(support, "shipment:view")).toBe(true);
    expect(can(support, "message:reply")).toBe(true);
    expect(can(support, "shipment:create")).toBe(false);
    expect(can(support, "shipment:delete")).toBe(false);
  });

  it("denies staff with no staffRole assigned", () => {
    const brokenStaff = { role: "MERCHANT_STAFF" as const, staffRole: null };
    expect(can(brokenStaff, "shipment:view")).toBe(false);
  });

  it("requirePermission throws for a disallowed action", () => {
    const support = { role: "MERCHANT_STAFF" as const, staffRole: "CUSTOMER_SUPPORT" as const };
    expect(() => requirePermission(support, "shipment:create")).toThrow(/Forbidden/);
  });

  it("requirePermission does not throw for an allowed action", () => {
    const owner = { role: "MERCHANT_OWNER" as const, staffRole: null };
    expect(() => requirePermission(owner, "shipment:create")).not.toThrow();
  });
});
