"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchantUser, requireSuperAdmin, requireUser } from "@/lib/session";
import { requirePermission } from "@/lib/permissions";
import { hashPassword, verifyPassword } from "@/lib/password";
import { recordAudit } from "@/lib/audit";
import type { ActionResult } from "@/actions/shipments";

export async function updatePlatformSettingsAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireSuperAdmin();
  const platformName = String(formData.get("platformName") ?? "").trim();
  const supportEmail = String(formData.get("supportEmail") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const notificationsEnabled = formData.get("notificationsEnabled") === "on";

  if (!platformName) return { success: false, error: "Platform name is required" };

  await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: { platformName, supportEmail: supportEmail || null, logoUrl: logoUrl || null, notificationsEnabled },
    create: {
      id: "singleton",
      platformName,
      supportEmail: supportEmail || null,
      logoUrl: logoUrl || null,
      notificationsEnabled,
    },
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "platform_settings.updated",
    entityType: "PlatformSettings",
    newValue: { platformName, supportEmail, notificationsEnabled },
  });

  revalidatePath("/super-admin/settings");
  return { success: true };
}

export async function updateMerchantSettingsAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireMerchantUser();
  requirePermission(actor, "settings:manage");

  const businessName = String(formData.get("businessName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const businessAddress = String(formData.get("businessAddress") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();

  if (!businessName) return { success: false, error: "Business name is required" };

  await prisma.merchant.update({
    where: { id: actor.merchantId },
    data: { businessName, phone, businessAddress, city, country, logoUrl: logoUrl || null },
  });

  await recordAudit({
    actorUserId: actor.id,
    actorLabel: actor.name,
    action: "merchant.settings_updated",
    entityType: "Merchant",
    entityId: actor.merchantId,
    merchantId: actor.merchantId,
  });

  revalidatePath("/merchant/settings");
  return { success: true };
}

export async function changeOwnPasswordAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) return { success: false, error: "New password must be at least 8 characters" };

  const user = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!user) return { success: false, error: "User not found" };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect" };

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: actor.id }, data: { passwordHash } });

  return { success: true };
}
