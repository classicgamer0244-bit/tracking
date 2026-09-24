import { PrismaClient, type ShipmentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL must be set to seed the database.");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);
const nanoShort = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
const hash = (pw: string) => bcrypt.hash(pw, 10);

const STATUS_ORDER: ShipmentStatus[] = [
  "SHIPMENT_CREATED",
  "ORDER_CONFIRMED",
  "LABEL_CREATED",
  "PICKED_UP",
  "PROCESSING",
  "DEPARTED_FACILITY",
  "IN_TRANSIT",
  "ARRIVED_AT_FACILITY",
  "CUSTOMS_PROCESSING",
  "CUSTOMS_CLEARED",
  "OUT_FOR_DELIVERY",
  "DELIVERY_ATTEMPTED",
  "DELIVERED",
];

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Germany", "Ghana", "Nigeria", "Australia"];
const CITIES: Record<string, string[]> = {
  "United States": ["New York, NY", "Los Angeles, CA", "Chicago, IL"],
  "United Kingdom": ["London", "Manchester"],
  Canada: ["Toronto, ON", "Vancouver, BC"],
  Germany: ["Berlin", "Munich"],
  Ghana: ["Accra", "Kumasi"],
  Nigeria: ["Lagos", "Abuja"],
  Australia: ["Sydney, NSW", "Melbourne, VIC"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number) {
  return new Date(Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Seeding database...");

  // Clean slate (idempotent local/dev seeding).
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.platformSettings.deleteMany();

  await prisma.platformSettings.create({
    data: { id: "singleton", platformName: "ShipTrack", supportEmail: "support@shiptrack.demo" },
  });

  const superAdminPassword = await hash("SuperAdmin123!");
  await prisma.user.create({
    data: {
      email: "admin@shiptrack.demo",
      username: "superadmin",
      passwordHash: superAdminPassword,
      name: "Alex Morgan",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Created Super Admin: admin@shiptrack.demo / SuperAdmin123!");

  const merchantSeeds = [
    {
      businessName: "Northwind Logistics",
      merchantName: "Priya Nair",
      email: "owner@northwind.demo",
      username: "northwind",
      country: "United States",
      city: "New York, NY",
    },
    {
      businessName: "Accra Express Couriers",
      merchantName: "Kwame Asante",
      email: "owner@accraexpress.demo",
      username: "accraexpress",
      country: "Ghana",
      city: "Accra",
    },
    {
      businessName: "Maple Freight Co.",
      merchantName: "Sarah Thompson",
      email: "owner@maplefreight.demo",
      username: "maplefreight",
      country: "Canada",
      city: "Toronto, ON",
    },
  ];

  const merchantPassword = await hash("Merchant123!");
  const staffPassword = await hash("Staff123!");

  for (const seed of merchantSeeds) {
    const merchant = await prisma.merchant.create({
      data: {
        merchantCode: `MCH-${nanoShort()}`,
        businessName: seed.businessName,
        merchantName: seed.merchantName,
        email: seed.email,
        phone: "+1 555 0100",
        businessAddress: "100 Commerce Street",
        country: seed.country,
        city: seed.city,
        status: "ACTIVE",
        users: {
          create: [
            {
              email: seed.email,
              username: seed.username,
              passwordHash: merchantPassword,
              name: seed.merchantName,
              role: "MERCHANT_OWNER",
              status: "ACTIVE",
            },
            {
              email: `support@${seed.username}.demo`,
              username: `${seed.username}-support`,
              passwordHash: staffPassword,
              name: "Jordan Lee",
              role: "MERCHANT_STAFF",
              staffRole: "CUSTOMER_SUPPORT",
              status: "ACTIVE",
            },
            {
              email: `ops@${seed.username}.demo`,
              username: `${seed.username}-ops`,
              passwordHash: staffPassword,
              name: "Riley Chen",
              role: "MERCHANT_STAFF",
              staffRole: "SHIPMENT_MANAGER",
              status: "ACTIVE",
            },
          ],
        },
      },
      include: { users: true },
    });

    console.log(`Created merchant: ${merchant.businessName} (${seed.email} / Merchant123!)`);

    const shipmentCount = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < shipmentCount; i++) {
      const originCountry = seed.country;
      const originCity = pick(CITIES[originCountry]);
      const destCountry = pick(COUNTRIES);
      const destCity = pick(CITIES[destCountry]);

      const progressIdx = Math.floor(Math.random() * STATUS_ORDER.length);
      const isDelayed = Math.random() < 0.12;
      const isCancelled = !isDelayed && Math.random() < 0.05;
      const finalStatus: ShipmentStatus = isCancelled
        ? "CANCELLED"
        : isDelayed
          ? "DELAYED"
          : STATUS_ORDER[progressIdx];

      const createdAt = randomDate(45);
      const trackingNumber = `STK-${nano()}`;

      const shipment = await prisma.shipment.create({
        data: {
          trackingNumber,
          merchantId: merchant.id,
          shipmentType: pick(["Parcel", "Document", "Freight", "Pallet"]),
          description: pick([
            "Electronics accessories",
            "Apparel and footwear",
            "Spare parts",
            "Office supplies",
            "Printed materials",
          ]),
          quantity: 1 + Math.floor(Math.random() * 5),
          weight: Number((0.5 + Math.random() * 20).toFixed(2)),
          dimensions: "30 x 20 x 15 cm",
          service: pick(["Standard", "Express", "Overnight", "Economy"]),
          cost: Number((10 + Math.random() * 150).toFixed(2)),
          insurance: Math.random() < 0.3,
          estimatedDelivery: new Date(createdAt.getTime() + (3 + Math.random() * 10) * 24 * 60 * 60 * 1000),
          status: finalStatus,
          origin: `${originCity}, ${originCountry}`,
          destination: `${destCity}, ${destCountry}`,
          currentLocation: `${destCity}, ${destCountry}`,
          departureLocation: `${originCity}, ${originCountry}`,
          arrivalLocation: `${destCity}, ${destCountry}`,
          senderName: seed.merchantName,
          senderCompany: seed.businessName,
          senderEmail: seed.email,
          senderPhone: "+1 555 0100",
          senderAddress: "100 Commerce Street",
          senderCity: originCity,
          senderCountry: originCountry,
          recipientName: pick(["Emma Wilson", "Liam Carter", "Olivia Brooks", "Noah Bennett", "Ava Mitchell"]),
          recipientEmail: "customer@example.com",
          recipientPhone: "+1 555 0199",
          recipientAddress: "42 Market Avenue",
          recipientCity: destCity,
          recipientCountry: destCountry,
          createdAt,
          updatedAt: createdAt,
        },
      });

      const eventsToCreate = isCancelled || isDelayed ? progressIdx + 2 : progressIdx + 1;
      let eventTime = createdAt;
      for (let s = 0; s < Math.min(eventsToCreate, STATUS_ORDER.length); s++) {
        eventTime = new Date(eventTime.getTime() + (2 + Math.random() * 10) * 60 * 60 * 1000);
        await prisma.trackingEvent.create({
          data: {
            shipmentId: shipment.id,
            status: STATUS_ORDER[s],
            location: s < 2 ? `${originCity}, ${originCountry}` : `${destCity}, ${destCountry}`,
            occurredAt: eventTime,
            description: `Shipment ${STATUS_ORDER[s].replace(/_/g, " ").toLowerCase()}.`,
            visibility: Math.random() < 0.15 ? "INTERNAL" : "PUBLIC",
          },
        });
      }
      if (isDelayed || isCancelled) {
        eventTime = new Date(eventTime.getTime() + 6 * 60 * 60 * 1000);
        await prisma.trackingEvent.create({
          data: {
            shipmentId: shipment.id,
            status: finalStatus,
            location: `${destCity}, ${destCountry}`,
            occurredAt: eventTime,
            description: isCancelled
              ? "Shipment was cancelled by the merchant."
              : "Shipment delayed due to customs processing.",
            visibility: "PUBLIC",
          },
        });
      }

      // A handful of shipments get a customer conversation.
      if (Math.random() < 0.4) {
        const customer = await prisma.customer.create({
          data: {
            name: shipment.recipientName,
            email: "customer@example.com",
            phone: shipment.recipientPhone,
          },
        });
        const conversation = await prisma.conversation.create({
          data: {
            shipmentId: shipment.id,
            merchantId: merchant.id,
            customerId: customer.id,
            lastMessageAt: new Date(),
          },
        });
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderType: "CUSTOMER",
            body: "Hi, where is my shipment right now? It seems to be taking longer than expected.",
          },
        });
        if (Math.random() < 0.6) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderType: "MERCHANT",
              senderUserId: merchant.users[0].id,
              body: `Thanks for reaching out! Your shipment ${shipment.trackingNumber} is currently ${finalStatus
                .replace(/_/g, " ")
                .toLowerCase()}. We'll keep you posted.`,
              readAt: new Date(),
            },
          });
        } else {
          await prisma.notification.create({
            data: {
              recipientType: "MERCHANT",
              merchantId: merchant.id,
              type: "NEW_MESSAGE",
              title: `New message about ${shipment.trackingNumber}`,
              body: "Customer is asking about delivery status.",
              entityType: "Conversation",
              entityId: conversation.id,
            },
          });
        }
      }

      await prisma.notification.create({
        data: {
          recipientType: "MERCHANT",
          merchantId: merchant.id,
          type: "SHIPMENT_CREATED",
          title: "New shipment created",
          body: `Shipment ${shipment.trackingNumber} was created.`,
          entityType: "Shipment",
          entityId: shipment.id,
          read: Math.random() < 0.5,
          createdAt,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorLabel: "System seed",
        action: "merchant.created",
        entityType: "Merchant",
        entityId: merchant.id,
        merchantId: merchant.id,
        newValue: { businessName: merchant.businessName },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
