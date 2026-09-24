import type { PlatformRole, StaffRole } from "@prisma/client";

export type Actor = {
  role: PlatformRole;
  staffRole: StaffRole | null;
};

export type MerchantAction =
  | "shipment:create"
  | "shipment:edit"
  | "shipment:updateStatus"
  | "shipment:addEvent"
  | "shipment:delete"
  | "shipment:archive"
  | "shipment:view"
  | "message:view"
  | "message:reply"
  | "message:archive"
  | "message:delete"
  | "staff:manage"
  | "settings:manage";

/**
 * Server-side permission matrix. Every mutating server action must call
 * `can()` after resolving the session — the client's UI hiding a button is
 * a convenience only, never a security boundary.
 */
const MATRIX: Record<StaffRole | "OWNER", Set<MerchantAction>> = {
  OWNER: new Set([
    "shipment:create",
    "shipment:edit",
    "shipment:updateStatus",
    "shipment:addEvent",
    "shipment:delete",
    "shipment:archive",
    "shipment:view",
    "message:view",
    "message:reply",
    "message:archive",
    "message:delete",
    "settings:manage",
  ]),
  MANAGER: new Set([
    "shipment:create",
    "shipment:edit",
    "shipment:updateStatus",
    "shipment:addEvent",
    "shipment:archive",
    "shipment:view",
    "message:view",
    "message:reply",
    "message:archive",
  ]),
  SHIPMENT_MANAGER: new Set([
    "shipment:create",
    "shipment:edit",
    "shipment:updateStatus",
    "shipment:addEvent",
    "shipment:archive",
    "shipment:view",
    "message:view",
  ]),
  CUSTOMER_SUPPORT: new Set([
    "shipment:view",
    "message:view",
    "message:reply",
    "message:archive",
  ]),
};

export function can(actor: Actor, action: MerchantAction): boolean {
  if (actor.role === "SUPER_ADMIN") return true;
  if (actor.role === "MERCHANT_OWNER") return MATRIX.OWNER.has(action);
  if (actor.role === "MERCHANT_STAFF" && actor.staffRole) {
    return MATRIX[actor.staffRole]?.has(action) ?? false;
  }
  return false;
}

export function requirePermission(actor: Actor, action: MerchantAction) {
  if (!can(actor, action)) {
    throw new Error(`Forbidden: missing permission ${action}`);
  }
}
