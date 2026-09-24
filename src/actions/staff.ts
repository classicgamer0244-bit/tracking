"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchantUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { hashPassword, generateTempPassword } from "@/lib/password";
import { recordAudit } from "@/lib/audit";
import { createStaffSchema } from "@/lib/validators/staff";
import type { ActionResult } from "@/actions/shipments";

export async function createStaffAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "staff:manage");

  const raw = Object.fromEntries(formData.entries());
  const parsed = createStaffSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const [emailTaken, usernameTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email.toLowerCase() } }),
    prisma.user.findUnique({ where: { username: data.username.toLowerCase() } }),
  ]);
  if (emailTaken) return { success: false, error: "A user with that email already exists." };
  if (usernameTaken) return { success: false, error: "That username is already taken." };

  const passwordHash = await hashPassword(data.password);
  const staff = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      passwordHash,
      name: data.name,
      role: "MERCHANT_STAFF",
      staffRole: data.staffRole,
      status: "ACTIVE",
      merchantId: actor.merchantId,
    },
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "staff.created",
    entityType: "User",
    entityId: staff.id,
    merchantId: actor.merchantId,
    newValue: { name: staff.name, staffRole: staff.staffRole },
  });

  revalidatePath("/merchant/staff");
  return { success: true, id: staff.id };
}

export async function setStaffStatusAction(
  staffId: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "staff:manage");

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || staff.merchantId !== actor.merchantId || staff.role !== "MERCHANT_STAFF") {
    return { success: false, error: "Staff member not found" };
  }

  await prisma.user.update({ where: { id: staffId }, data: { status } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "staff.status_changed",
    entityType: "User",
    entityId: staffId,
    merchantId: actor.merchantId,
    newValue: { status },
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function deleteStaffAction(staffId: string): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "staff:manage");

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || staff.merchantId !== actor.merchantId || staff.role !== "MERCHANT_STAFF") {
    return { success: false, error: "Staff member not found" };
  }

  await prisma.user.delete({ where: { id: staffId } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "staff.deleted",
    entityType: "User",
    entityId: staffId,
    merchantId: actor.merchantId,
  });

  revalidatePath("/merchant/staff");
  return { success: true };
}

export async function resetStaffPasswordAction(
  staffId: string,
): Promise<ActionResult & { tempPassword?: string }> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "staff:manage");

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || staff.merchantId !== actor.merchantId) {
    return { success: false, error: "Staff member not found" };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await prisma.user.update({ where: { id: staffId }, data: { passwordHash } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "staff.password_reset",
    entityType: "User",
    entityId: staffId,
    merchantId: actor.merchantId,
  });

  revalidatePath("/merchant/staff");
  return { success: true, tempPassword };
}
