import { describe, it, expect } from "vitest";
import { createMerchantSchema } from "@/lib/validators/merchant";
import { shipmentFormSchema, trackingEventSchema } from "@/lib/validators/shipment";
import { contactMerchantSchema } from "@/lib/validators/message";

describe("createMerchantSchema", () => {
  const valid = {
    email: "jane@acme.test",
    password: "supersecret1",
    confirmPassword: "supersecret1",
  };

  it("accepts email + password + matching confirmation", () => {
    expect(createMerchantSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = createMerchantSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = createMerchantSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects a mismatched confirmation password", () => {
    const result = createMerchantSchema.safeParse({ ...valid, confirmPassword: "somethingElse1" });
    expect(result.success).toBe(false);
  });
});

describe("shipmentFormSchema", () => {
  const valid = {
    shipmentType: "Parcel",
    description: "Books",
    service: "Standard",
    origin: "New York, NY",
    destination: "Chicago, IL",
    senderName: "Sender",
    senderAddress: "1 Sender St",
    senderCity: "New York",
    senderCountry: "USA",
    recipientName: "Recipient",
    recipientAddress: "2 Recipient Ave",
    recipientCity: "Chicago",
    recipientCountry: "USA",
  };

  it("accepts a minimal valid shipment", () => {
    const result = shipmentFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a shipment missing required recipient fields", () => {
    const { recipientName: _recipientName, ...rest } = valid;
    const result = shipmentFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("defaults quantity to 1 and insurance to false", () => {
    const result = shipmentFormSchema.parse(valid);
    expect(result.quantity).toBe(1);
    expect(result.insurance).toBe(false);
  });
});

describe("trackingEventSchema", () => {
  it("requires location, date, time, and description", () => {
    const result = trackingEventSchema.safeParse({
      shipmentId: "abc",
      status: "IN_TRANSIT",
      location: "",
      date: "2026-01-01",
      time: "10:00",
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("defaults visibility to PUBLIC", () => {
    const result = trackingEventSchema.parse({
      shipmentId: "abc",
      status: "IN_TRANSIT",
      location: "Accra",
      date: "2026-01-01",
      time: "10:00",
      description: "Left the facility",
    });
    expect(result.visibility).toBe("PUBLIC");
  });
});

describe("contactMerchantSchema", () => {
  it("rejects a message that is too short", () => {
    const result = contactMerchantSchema.safeParse({
      trackingNumber: "STK-ABC123",
      name: "Customer",
      email: "customer@example.com",
      message: "hi",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid contact message", () => {
    const result = contactMerchantSchema.safeParse({
      trackingNumber: "STK-ABC123",
      name: "Customer",
      email: "customer@example.com",
      message: "Where is my shipment?",
    });
    expect(result.success).toBe(true);
  });
});
