import { prisma } from "@/lib/prisma";

type AuditParams = {
  actorUserId?: string | null;
  actorLabel: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  merchantId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
};

/** Records a sensitive platform action. Never throws — audit logging must never break the calling action. */
export async function recordAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId ?? null,
        actorLabel: params.actorLabel,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        merchantId: params.merchantId ?? null,
        previousValue: params.previousValue === undefined ? undefined : JSON.parse(JSON.stringify(params.previousValue)),
        newValue: params.newValue === undefined ? undefined : JSON.parse(JSON.stringify(params.newValue)),
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log", err);
  }
}
