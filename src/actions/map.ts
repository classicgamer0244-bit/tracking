"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { resolvePosition } from "@/lib/geo/resolve-position";
import { statusBucket } from "@/lib/shipment-status";
import type { ShipmentStatus } from "@prisma/client";

export type MapShipment = {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  bucket: ReturnType<typeof statusBucket>;
  merchantName: string;
  origin: string;
  destination: string;
  currentLocation: string | null;
  coords: [number, number] | null;
};

export async function getLiveMapShipments(): Promise<{ shipments: MapShipment[]; unplottedCount: number }> {
  const actor = await requireUser();

  const where =
    actor.role === "SUPER_ADMIN"
      ? { archived: false, status: { not: "CANCELLED" as const } }
      : { archived: false, status: { not: "CANCELLED" as const }, merchantId: actor.merchantId ?? "__none__" };

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 250,
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      origin: true,
      destination: true,
      currentLocation: true,
      senderCity: true,
      senderCountry: true,
      recipientCity: true,
      recipientCountry: true,
      merchant: { select: { businessName: true, email: true } },
    },
  });

  const plotted: MapShipment[] = [];
  let unplottedCount = 0;

  for (const s of shipments) {
    const { current } = resolvePosition(s);
    if (!current) {
      unplottedCount += 1;
      continue;
    }
    plotted.push({
      id: s.id,
      trackingNumber: s.trackingNumber,
      status: s.status,
      bucket: statusBucket(s.status),
      merchantName: s.merchant.businessName ?? s.merchant.email,
      origin: s.origin,
      destination: s.destination,
      currentLocation: s.currentLocation,
      coords: current,
    });
  }

  return { shipments: plotted, unplottedCount };
}
