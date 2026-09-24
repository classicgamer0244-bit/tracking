import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Public, unauthenticated shipment lookup. Deliberately selects only the
 * fields that are safe to expose to a customer with just a tracking number —
 * no merchant contact info, no sender/recipient PII beyond city/country, and
 * only PUBLIC-visibility tracking events.
 */
export async function getPublicShipmentByTrackingNumber(trackingNumber: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: trackingNumber.trim().toUpperCase() },
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      shipmentType: true,
      weight: true,
      origin: true,
      destination: true,
      currentLocation: true,
      estimatedDelivery: true,
      createdAt: true,
      recipientCity: true,
      recipientCountry: true,
      merchant: { select: { businessName: true, status: true } },
      trackingEvents: {
        where: { visibility: "PUBLIC" },
        orderBy: { occurredAt: "desc" },
        select: {
          id: true,
          status: true,
          location: true,
          occurredAt: true,
          description: true,
        },
      },
    },
  });

  if (!shipment) return null;
  // Hide shipments belonging to a merchant whose account is no longer active,
  // without revealing why to an anonymous visitor.
  if (shipment.merchant.status !== "ACTIVE") return null;

  return shipment;
}
