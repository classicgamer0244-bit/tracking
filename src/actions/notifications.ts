"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function getMyNotifications() {
  const user = await requireUser();

  const where =
    user.role === "SUPER_ADMIN"
      ? { recipientType: "SUPER_ADMIN" as const }
      : { recipientType: "MERCHANT" as const, merchantId: user.merchantId };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { ...where, read: false } }),
  ]);

  return { notifications, unreadCount };
}

export async function markNotificationRead(id: string) {
  const user = await requireUser();
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return;

  const owns =
    (user.role === "SUPER_ADMIN" && notification.recipientType === "SUPER_ADMIN") ||
    (notification.recipientType === "MERCHANT" && notification.merchantId === user.merchantId);
  if (!owns) throw new Error("Forbidden");

  await prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  const where =
    user.role === "SUPER_ADMIN"
      ? { recipientType: "SUPER_ADMIN" as const }
      : { recipientType: "MERCHANT" as const, merchantId: user.merchantId };

  await prisma.notification.updateMany({ where: { ...where, read: false }, data: { read: true } });
}
