"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { resolveCoords, interpolate } from "@/lib/geo/city-coords";
import { SHIPMENT_STATUS_ORDER, statusIndex, statusBucket } from "@/lib/shipment-status";
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

function positionFor(shipment: {
  status: ShipmentStatus;
  origin: string;
  destination: string;
  currentLocation: string | null;
  senderCity: string;
  senderCountry: string;
  recipientCity: string;
  recipientCountry: string;
}): [number, number] | null {
  const originCoords = resolveCoords(shipment.senderCity, shipment.senderCountry) ?? resolveCoords(shipment.origin);
  const destCoords = resolveCoords(shipment.recipientCity, shipment.recipientCountry) ?? resolveCoords(shipment.destination);

  // Prefer the actual logged current location when we can place it.
  const liveCoords = resolveCoords(shipment.currentLocation);
  if (liveCoords && shipment.currentLocation && shipment.currentLocation !== shipment.origin) {
    return liveCoords;
  }

  if (shipment.status === "DELIVERED") return destCoords ?? originCoords;
  if (["CANCELLED", "RETURNED"].includes(shipment.status)) return originCoords ?? destCoords;
  if (!originCoords && !destCoords) return null;
  if (!originCoords) return destCoords;
  if (!destCoords) return originCoords;

  const idx = statusIndex(shipment.status);
  const fraction = idx < 0 ? 0.5 : idx / (SHIPMENT_STATUS_ORDER.length - 1);
  return interpolate(originCoords, destCoords, fraction);
}

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
      merchant: { select: { businessName: true } },
    },
  });

  const plotted: MapShipment[] = [];
  let unplottedCount = 0;

  for (const s of shipments) {
    const coords = positionFor(s);
    if (!coords) {
      unplottedCount += 1;
      continue;
    }
    plotted.push({
      id: s.id,
      trackingNumber: s.trackingNumber,
      status: s.status,
      bucket: statusBucket(s.status),
      merchantName: s.merchant.businessName,
      origin: s.origin,
      destination: s.destination,
      currentLocation: s.currentLocation,
      coords,
    });
  }

  return { shipments: plotted, unplottedCount };
}
