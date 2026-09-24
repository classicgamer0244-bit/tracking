import "server-only";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

const DELAYED_STATUSES = ["DELAYED", "HELD_AT_CUSTOMS"] as const;
const IN_TRANSIT_STATUSES = [
  "DEPARTED_FACILITY",
  "IN_TRANSIT",
  "ARRIVED_AT_FACILITY",
  "CUSTOMS_PROCESSING",
  "CUSTOMS_CLEARED",
] as const;

export async function getMerchantDashboard(merchantId: string) {
  const base = { merchantId, archived: false } as const;

  const [
    total,
    delivered,
    inTransit,
    outForDelivery,
    delayed,
    cancelled,
    unreadMessages,
    recentShipments,
    last14Days,
  ] = await Promise.all([
    prisma.shipment.count({ where: base }),
    prisma.shipment.count({ where: { ...base, status: "DELIVERED" } }),
    prisma.shipment.count({ where: { ...base, status: { in: [...IN_TRANSIT_STATUSES] } } }),
    prisma.shipment.count({ where: { ...base, status: { in: ["OUT_FOR_DELIVERY", "DELIVERY_ATTEMPTED"] } } }),
    prisma.shipment.count({ where: { ...base, status: { in: [...DELAYED_STATUSES] } } }),
    prisma.shipment.count({ where: { ...base, status: { in: ["CANCELLED", "RETURNED"] } } }),
    prisma.message.count({
      where: { readAt: null, senderType: "CUSTOMER", conversation: { merchantId } },
    }),
    prisma.shipment.findMany({
      where: base,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.shipment.findMany({
      where: { merchantId, createdAt: { gte: startOfDay(subDays(new Date(), 13)) } },
      select: { createdAt: true, status: true },
    }),
  ]);

  const active = total - delivered - cancelled;

  const trend = buildDailyTrend(last14Days.map((s) => s.createdAt));

  return {
    total,
    active,
    delivered,
    inTransit,
    outForDelivery,
    delayed,
    cancelled,
    unreadMessages,
    recentShipments,
    trend,
  };
}

export async function getSuperAdminDashboard() {
  const [
    totalMerchants,
    activeMerchants,
    totalShipments,
    shipmentsToday,
    inTransit,
    delivered,
    delayed,
    totalMessages,
    recentMerchants,
    last14Days,
  ] = await Promise.all([
    prisma.merchant.count(),
    prisma.merchant.count({ where: { status: "ACTIVE" } }),
    prisma.shipment.count(),
    prisma.shipment.count({ where: { createdAt: { gte: startOfDay(new Date()) } } }),
    prisma.shipment.count({ where: { status: { in: [...IN_TRANSIT_STATUSES] } } }),
    prisma.shipment.count({ where: { status: "DELIVERED" } }),
    prisma.shipment.count({ where: { status: { in: [...DELAYED_STATUSES] } } }),
    prisma.message.count(),
    prisma.merchant.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.shipment.findMany({
      where: { createdAt: { gte: startOfDay(subDays(new Date(), 13)) } },
      select: { createdAt: true },
    }),
  ]);

  const trend = buildDailyTrend(last14Days.map((s) => s.createdAt));

  return {
    totalMerchants,
    activeMerchants,
    totalShipments,
    shipmentsToday,
    inTransit,
    delivered,
    delayed,
    totalMessages,
    recentMerchants,
    trend,
  };
}

function buildDailyTrend(dates: Date[]) {
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = startOfDay(subDays(new Date(), i));
    const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = dates.filter((d) => startOfDay(d).getTime() === day.getTime()).length;
    days.push({ date: label, count });
  }
  return days;
}
