import "server-only";
import { resolveCoords, interpolate, type LatLng } from "@/lib/geo/city-coords";
import { SHIPMENT_STATUS_ORDER, statusIndex } from "@/lib/shipment-status";
import type { ShipmentStatus } from "@prisma/client";

export type GeoShipment = {
  status: ShipmentStatus;
  origin: string;
  destination: string;
  currentLocation: string | null;
  senderCity: string;
  senderCountry: string;
  recipientCity: string;
  recipientCountry: string;
};

export type ResolvedPosition = {
  current: LatLng | null;
  origin: LatLng | null;
  destination: LatLng | null;
};

/** Best-effort current position for a shipment, plus its resolved endpoints (for drawing a route line). */
export function resolvePosition(shipment: GeoShipment): ResolvedPosition {
  const origin = resolveCoords(shipment.senderCity, shipment.senderCountry) ?? resolveCoords(shipment.origin);
  const destination = resolveCoords(shipment.recipientCity, shipment.recipientCountry) ?? resolveCoords(shipment.destination);

  // Prefer the actual logged current location when we can place it.
  const liveCoords = resolveCoords(shipment.currentLocation);
  if (liveCoords && shipment.currentLocation && shipment.currentLocation !== shipment.origin) {
    return { current: liveCoords, origin, destination };
  }

  if (shipment.status === "DELIVERED") return { current: destination ?? origin, origin, destination };
  if (shipment.status === "CANCELLED" || shipment.status === "RETURNED") {
    return { current: origin ?? destination, origin, destination };
  }
  if (!origin && !destination) return { current: null, origin, destination };
  if (!origin) return { current: destination, origin, destination };
  if (!destination) return { current: origin, origin, destination };

  const idx = statusIndex(shipment.status);
  const fraction = idx < 0 ? 0.5 : idx / (SHIPMENT_STATUS_ORDER.length - 1);
  return { current: interpolate(origin, destination, fraction), origin, destination };
}
