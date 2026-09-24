"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/session";
import { hashPassword } from "@/lib/password";
import { generateMerchantCode } from "@/lib/tracking-number";
import { recordAudit } from "@/lib/audit";
import { notifySuperAdmin } from "@/lib/notifications";
import { createMerchantSchema, updateMerchantSchema, setPasswordSchema } from "@/lib/validators/merchant";
import type { ActionResult } from "@/actions/shipments";
import type { MerchantStatus } from "@prisma/client";

export type CreateMerchantResult = ActionResult & {
  merchant?: { id: string; email: string; merchantCode: string; status: MerchantStatus };
};

/** Super Admin merchant creation — email + password only. Everything else
 * (business name, contact info, logo...) is filled in later by the merchant
 * themselves from Settings, or left blank. */
export async function createMerchantAction(
  _prevState: CreateMerchantResult,
  formData: FormData,
): Promise<CreateMerchantResult> {
  const actor = await requireSuperAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = createMerchantSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();

  const [emailTakenOnUser, emailTakenOnMerchant] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.merchant.findUnique({ where: { email } }),
  ]);
  if (emailTakenOnUser || emailTakenOnMerchant) {
    return { success: false, error: "A merchant with that email already exists." };
  }

  let merchantCode = generateMerchantCode();
  while (await prisma.merchant.findUnique({ where: { merchantCode } })) {
    merchantCode = generateMerchantCode();
  }

  const passwordHash = await hashPassword(data.password);

  const merchant = await prisma.merchant.create({
    data: {
      merchantCode,
      email,
      status: "ACTIVE",
      users: {
        create: {
          email,
          // Username has no separate UI in the simplified flow — the email
          // itself is unique and doubles as the username for identifier lookups.
          username: email,
          passwordHash,
          name: email.split("@")[0],
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
    newValue: { email: merchant.email, merchantCode: merchant.merchantCode },
  });

  revalidatePath("/super-admin/merchants");
  return {
    success: true,
    id: merchant.id,
    merchant: { id: merchant.id, email: merchant.email, merchantCode: merchant.merchantCode, status: merchant.status },
  };
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
      businessName: data.businessName || null,
      merchantName: data.merchantName || null,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      businessAddress: data.businessAddress || null,
      country: data.country || null,
      city: data.city || null,
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
  status: MerchantStatus,
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
    title: `Merchant ${existing.businessName ?? existing.email} ${status.toLowerCase()}`,
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
    previousValue: { email: existing.email, merchantCode: existing.merchantCode },
  });

  revalidatePath("/super-admin/merchants");
  return { success: true };
}

/** Super Admin sets a new password directly — never shown or auto-generated,
 * the admin types it and the merchant is expected to use exactly that. */
export async function resetMerchantPasswordAction(
  merchantUserId: string,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireSuperAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = setPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({ where: { id: merchantUserId } });
  if (!user) return { success: false, error: "User not found" };

  const passwordHash = await hashPassword(parsed.data.newPassword);
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
  return { success: true };
}
