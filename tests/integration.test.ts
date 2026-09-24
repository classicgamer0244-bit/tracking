import "./setup/next-stubs";
import { mockSessionState } from "./setup/session-mock";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  createShipmentAction,
  updateShipmentAction,
  updateShipmentStatusAction,
  archiveShipmentAction,
  deleteShipmentAction,
} from "@/actions/shipments";
import { contactMerchantAction, replyToConversationAction } from "@/actions/messages";
import { createStaffAction } from "@/actions/staff";
import { getPublicShipmentByTrackingNumber } from "@/lib/queries/public-tracking";
import type { SessionUser } from "@/lib/session";

const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const baseShipmentFields = {
  shipmentType: "Parcel",
  description: "Test package",
  service: "Standard",
  origin: "New York, NY",
  destination: "Chicago, IL",
  senderName: "Merchant A Sender",
  senderAddress: "1 Sender St",
  senderCity: "New York",
  senderCountry: "USA",
  recipientName: "Test Recipient",
  recipientAddress: "2 Recipient Ave",
  recipientCity: "Chicago",
  recipientCountry: "USA",
};

d("Tenant isolation, shipment lifecycle, and messaging (requires DATABASE_URL)", () => {
  let merchantAId: string;
  let merchantBId: string;
  let ownerA: SessionUser;
  let ownerB: SessionUser;
  let supportStaffA: SessionUser;
  const testTag = `test-${Date.now()}`;

  beforeAll(async () => {
    const passwordHash = await hashPassword("Test1234!");

    const merchantA = await prisma.merchant.create({
      data: {
        merchantCode: `TST-A-${testTag}`,
        businessName: `Merchant A ${testTag}`,
        merchantName: "Owner A",
        email: `owner-a-${testTag}@test.local`,
        phone: "+1 555 0000",
        businessAddress: "1 Test St",
        country: "USA",
        city: "Testville",
        status: "ACTIVE",
        users: {
          create: [
            {
              email: `owner-a-${testTag}@test.local`,
              username: `owner-a-${testTag}`,
              passwordHash,
              name: "Owner A",
              role: "MERCHANT_OWNER",
              status: "ACTIVE",
            },
            {
              email: `support-a-${testTag}@test.local`,
              username: `support-a-${testTag}`,
              passwordHash,
              name: "Support A",
              role: "MERCHANT_STAFF",
              staffRole: "CUSTOMER_SUPPORT",
              status: "ACTIVE",
            },
          ],
        },
      },
      include: { users: true },
    });

    const merchantB = await prisma.merchant.create({
      data: {
        merchantCode: `TST-B-${testTag}`,
        businessName: `Merchant B ${testTag}`,
        merchantName: "Owner B",
        email: `owner-b-${testTag}@test.local`,
        phone: "+1 555 0001",
        businessAddress: "2 Test St",
        country: "USA",
        city: "Testville",
        status: "ACTIVE",
        users: { create: [{
          email: `owner-b-${testTag}@test.local`,
          username: `owner-b-${testTag}`,
          passwordHash,
          name: "Owner B",
          role: "MERCHANT_OWNER",
          status: "ACTIVE",
        }] },
      },
      include: { users: true },
    });

    merchantAId = merchantA.id;
    merchantBId = merchantB.id;

    const ownerAUser = merchantA.users.find((u) => u.role === "MERCHANT_OWNER")!;
    const supportAUser = merchantA.users.find((u) => u.staffRole === "CUSTOMER_SUPPORT")!;
    const ownerBUser = merchantB.users[0];

    ownerA = {
      id: ownerAUser.id,
      email: ownerAUser.email,
      name: ownerAUser.name,
      role: "MERCHANT_OWNER",
      staffRole: null,
      merchantId: merchantAId,
      merchantStatus: "ACTIVE",
    };
    supportStaffA = {
      id: supportAUser.id,
      email: supportAUser.email,
      name: supportAUser.name,
      role: "MERCHANT_STAFF",
      staffRole: "CUSTOMER_SUPPORT",
      merchantId: merchantAId,
      merchantStatus: "ACTIVE",
    };
    ownerB = {
      id: ownerBUser.id,
      email: ownerBUser.email,
      name: ownerBUser.name,
      role: "MERCHANT_OWNER",
      staffRole: null,
      merchantId: merchantBId,
      merchantStatus: "ACTIVE",
    };
  });

  afterAll(async () => {
    await prisma.merchant.deleteMany({ where: { id: { in: [merchantAId, merchantBId] } } });
    mockSessionState.user = null;
  });

  it("lets a merchant owner create a shipment with an auto-generated tracking number and initial event", async () => {
    mockSessionState.user = ownerA;
    const result = await createShipmentAction({ success: false }, formData(baseShipmentFields));
    expect(result.success).toBe(true);
    expect(result.id).toBeTruthy();

    const shipment = await prisma.shipment.findUnique({
      where: { id: result.id },
      include: { trackingEvents: true },
    });
    expect(shipment).not.toBeNull();
    expect(shipment!.trackingNumber).toMatch(/^STK-/);
    expect(shipment!.merchantId).toBe(merchantAId);
    expect(shipment!.trackingEvents).toHaveLength(1);
    expect(shipment!.trackingEvents[0].status).toBe("SHIPMENT_CREATED");
  });

  it("blocks a Customer Support staff member from creating a shipment (permission matrix)", async () => {
    mockSessionState.user = supportStaffA;
    await expect(
      createShipmentAction({ success: false }, formData(baseShipmentFields)),
    ).rejects.toThrow(/Forbidden/);
  });

  it("prevents Merchant B from viewing, editing, or deleting Merchant A's shipment by ID", async () => {
    mockSessionState.user = ownerA;
    const created = await createShipmentAction({ success: false }, formData(baseShipmentFields));
    const shipmentId = created.id!;

    mockSessionState.user = ownerB;

    await expect(
      updateShipmentAction(shipmentId, { success: false }, formData(baseShipmentFields)),
    ).rejects.toThrow(/different merchant/);

    await expect(archiveShipmentAction(shipmentId, true)).rejects.toThrow(/different merchant/);
    await expect(deleteShipmentAction(shipmentId)).rejects.toThrow(/different merchant/);

    // The shipment must still exist untouched, owned by Merchant A.
    const stillExists = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    expect(stillExists).not.toBeNull();
    expect(stillExists!.merchantId).toBe(merchantAId);
    expect(stillExists!.archived).toBe(false);
  });

  it("records a tracking event and notifies the merchant when status changes", async () => {
    mockSessionState.user = ownerA;
    const created = await createShipmentAction({ success: false }, formData(baseShipmentFields));
    const shipmentId = created.id!;

    const result = await updateShipmentStatusAction({
      shipmentId,
      status: "IN_TRANSIT",
      location: "Columbus, OH",
      description: "Left the regional hub",
    });
    expect(result.success).toBe(true);

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { trackingEvents: { orderBy: { occurredAt: "desc" } } },
    });
    expect(shipment!.status).toBe("IN_TRANSIT");
    expect(shipment!.trackingEvents[0].status).toBe("IN_TRANSIT");
    expect(shipment!.trackingEvents[0].location).toBe("Columbus, OH");

    const notification = await prisma.notification.findFirst({
      where: { merchantId: merchantAId, entityId: shipmentId, type: "SHIPMENT_STATUS_CHANGED" },
    });
    expect(notification).not.toBeNull();
  });

  it("exposes only PUBLIC tracking events on the public tracking page and hides suspended merchants", async () => {
    mockSessionState.user = ownerA;
    const created = await createShipmentAction({ success: false }, formData(baseShipmentFields));
    const shipmentId = created.id!;

    await prisma.trackingEvent.create({
      data: {
        shipmentId,
        status: "PROCESSING",
        location: "Internal warehouse",
        description: "Internal note not for customers",
        visibility: "INTERNAL",
      },
    });

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    const publicView = await getPublicShipmentByTrackingNumber(shipment!.trackingNumber);
    expect(publicView).not.toBeNull();
    const hasInternalLocation = publicView!.trackingEvents.some((e) => e.location === "Internal warehouse");
    expect(hasInternalLocation).toBe(false);

    // Suspend the merchant — the shipment must no longer resolve publicly.
    await prisma.merchant.update({ where: { id: merchantAId }, data: { status: "SUSPENDED" } });
    const afterSuspend = await getPublicShipmentByTrackingNumber(shipment!.trackingNumber);
    expect(afterSuspend).toBeNull();
    await prisma.merchant.update({ where: { id: merchantAId }, data: { status: "ACTIVE" } });
  });

  it("routes a customer message to the correct merchant and blocks Merchant B from replying", async () => {
    mockSessionState.user = ownerA;
    const created = await createShipmentAction({ success: false }, formData(baseShipmentFields));
    const shipmentId = created.id!;
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });

    mockSessionState.user = null; // public, unauthenticated contact form
    const contactResult = await contactMerchantAction(
      { success: false },
      formData({
        trackingNumber: shipment!.trackingNumber,
        name: "Curious Customer",
        email: "customer@test.local",
        message: "Where is my package right now?",
      }),
    );
    expect(contactResult.success).toBe(true);

    const conversation = await prisma.conversation.findUnique({ where: { id: contactResult.id! } });
    expect(conversation!.merchantId).toBe(merchantAId);

    mockSessionState.user = ownerB;
    const replyResult = await replyToConversationAction(
      { success: false },
      formData({ conversationId: conversation!.id, body: "This is not your conversation" }),
    );
    expect(replyResult.success).toBe(false);

    mockSessionState.user = ownerA;
    const goodReply = await replyToConversationAction(
      { success: false },
      formData({ conversationId: conversation!.id, body: "It's on its way!" }),
    );
    expect(goodReply.success).toBe(true);
  });

  it("forbids a merchant owner from creating staff", async () => {
    mockSessionState.user = ownerA;
    await expect(
      createStaffAction(
        { success: false },
        formData({
          name: "New Hire",
          email: `newhire-${testTag}@test.local`,
          username: `newhire-${testTag}`,
          password: "Test1234!",
          staffRole: "SHIPMENT_MANAGER",
        }),
      ),
    ).rejects.toThrow(/Forbidden/);
  });
});
