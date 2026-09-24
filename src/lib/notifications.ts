import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

type NotifyMerchantParams = {
  merchantId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
};

export async function notifyMerchant(params: NotifyMerchantParams) {
  await prisma.notification.create({
    data: {
      recipientType: "MERCHANT",
      merchantId: params.merchantId,
      type: params.type,
      title: params.title,
      body: params.body,
      entityType: params.entityType,
      entityId: params.entityId,
    },
  });
}

type NotifySuperAdminParams = Omit<NotifyMerchantParams, "merchantId">;

export async function notifySuperAdmin(params: NotifySuperAdminParams) {
  await prisma.notification.create({
    data: {
      recipientType: "SUPER_ADMIN",
      type: params.type,
      title: params.title,
      body: params.body,
      entityType: params.entityType,
      entityId: params.entityId,
    },
  });
}
