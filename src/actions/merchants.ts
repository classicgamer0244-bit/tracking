"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { hashPassword, generateTempPassword } from "@/lib/password";
import { generateMerchantCode } from "@/lib/tracking-number";
import { recordAudit } from "@/lib/audit";
import { notifySuperAdmin } from "@/lib/notifications";
import { createMerchantSchema, updateMerchantSchema } from "@/lib/validators/merchant";
import type { ActionResult } from "@/actions/shipments";

export async function createMerchantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireSuperAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = createMerchantSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const [emailTaken, usernameTaken] = await Promise.all([
    prisma.merchant.findUnique({ where: { email: data.email.toLowerCase() } }),
    prisma.merchant.findUnique({ where: { username: data.username.toLowerCase() } }),
  ]);
  if (emailTaken) return { success: false, error: "A merchant with that email already exists." };
  if (usernameTaken) return { success: false, error: "That username is already taken." };

  let merchantCode = generateMerchantCode();
  while (await prisma.merchant.findUnique({ where: { merchantCode } })) {
    merchantCode = generateMerchantCode();
  }

  const passwordHash = await hashPassword(data.password);

  const merchant = await prisma.merchant.create({
    data: {
      merchantCode,
      businessName: data.businessName,
      merchantName: data.merchantName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      username: data.username.toLowerCase(),
      businessAddress: data.businessAddress,
      country: data.country,
      city: data.city,
      status: data.status,
      logoUrl: data.logoUrl || null,
      users: {
        create: {
          email: data.email.toLowerCase(),
          username: data.username.toLowerCase(),
          passwordHash,
          name: data.merchantName,
          role: "MERCHANT_OWNER",
          status: "ACTIVE",
        },
      },
    },
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "merchant.created",
    entityType: "Merchant",
    entityId: merchant.id,
    merchantId: merchant.id,
    newValue: { businessName: merchant.businessName, merchantCode: merchant.merchantCode },
  });

  revalidatePath("/super-admin/merchants");
  return { success: true, id: merchant.id };
}

export async function updateMerchantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireSuperAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateMerchantSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const existing = await prisma.merchant.findUnique({ where: { id: data.id } });
  if (!existing) return { success: false, error: "Merchant not found" };

  const updated = await prisma.merchant.update({
    where: { id: data.id },
    data: {
      businessName: data.businessName,
      merchantName: data.merchantName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      businessAddress: data.businessAddress,
      country: data.country,
      city: data.city,
      status: data.status,
      logoUrl: data.logoUrl || null,
    },
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "merchant.updated",
    entityType: "Merchant",
    entityId: data.id,
    merchantId: data.id,
    previousValue: existing,
    newValue: updated,
  });

  revalidatePath("/super-admin/merchants");
  revalidatePath(`/super-admin/merchants/${data.id}`);
  return { success: true, id: data.id };
}

export async function setMerchantStatusAction(
  merchantId: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED",
): Promise<ActionResult> {
  const actor = await requireSuperAdmin();
  const existing = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!existing) return { success: false, error: "Merchant not found" };

  await prisma.merchant.update({ where: { id: merchantId }, data: { status } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "merchant.status_changed",
    entityType: "Merchant",
    entityId: merchantId,
    merchantId,
    previousValue: { status: existing.status },
    newValue: { status },
  });

  await notifySuperAdmin({
    type: "MERCHANT_STATUS_CHANGED",
    title: `Merchant ${existing.businessName} ${status.toLowerCase()}`,
    body: `Status changed from ${existing.status} to ${status}.`,
    entityType: "Merchant",
    entityId: merchantId,
  });

  revalidatePath("/super-admin/merchants");
  revalidatePath(`/super-admin/merchants/${merchantId}`);
  return { success: true };
}

export async function deleteMerchantAction(merchantId: string): Promise<ActionResult> {
  const actor = await requireSuperAdmin();
  const existing = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!existing) return { success: false, error: "Merchant not found" };

  await prisma.merchant.delete({ where: { id: merchantId } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "merchant.deleted",
    entityType: "Merchant",
    entityId: merchantId,
    previousValue: { businessName: existing.businessName, merchantCode: existing.merchantCode },
  });

  revalidatePath("/super-admin/merchants");
  return { success: true };
}

export async function resetMerchantPasswordAction(
  merchantUserId: string,
): Promise<ActionResult & { tempPassword?: string }> {
  const actor = await requireSuperAdmin();
  const user = await prisma.user.findUnique({ where: { id: merchantUserId } });
  if (!user) return { success: false, error: "User not found" };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await prisma.user.update({ where: { id: merchantUserId }, data: { passwordHash } });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "user.password_reset_by_admin",
    entityType: "User",
    entityId: merchantUserId,
    merchantId: user.merchantId,
  });

  revalidatePath(`/super-admin/merchants/${user.merchantId}`);
  return { success: true, tempPassword };
}
