import "./setup/next-stubs";
import { mockSessionState } from "./setup/session-mock";
import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createMerchantAction, setMerchantStatusAction } from "@/actions/merchants";
import { createShipmentAction } from "@/actions/shipments";
import type { SessionUser } from "@/lib/session";

const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const superAdmin: SessionUser = {
  id: "test-super-admin",
  email: "admin@test.local",
  name: "Test Admin",
  role: "SUPER_ADMIN",
  staffRole: null,
  merchantId: null,
  merchantStatus: null,
};

d("Simplified merchant creation (email + password only)", () => {
  const createdMerchantIds: string[] = [];

  afterEach(async () => {
    if (createdMerchantIds.length) {
      await prisma.merchant.deleteMany({ where: { id: { in: createdMerchantIds } } });
      createdMerchantIds.length = 0;
    }
    mockSessionState.user = null;
  });

  it("creates a merchant from just email + password, hashes the password, and never returns it", async () => {
    mockSessionState.user = superAdmin;
    const email = `newmerchant-${Date.now()}@test.local`;

    const result = await createMerchantAction(
      { success: false },
      formData({ email, password: "CorrectHorse1!", confirmPassword: "CorrectHorse1!" }),
    );

    expect(result.success).toBe(true);
    expect(result.merchant).toBeDefined();
    expect(result.merchant!.email).toBe(email.toLowerCase());
    expect(result.merchant!.status).toBe("ACTIVE");
    expect(result.merchant!.merchantCode).toMatch(/^MCH-/);
    // The action's return type has no password field at all — assert that directly.
    expect(Object.keys(result.merchant!)).not.toContain("password");
    createdMerchantIds.push(result.merchant!.id);

    const merchant = await prisma.merchant.findUnique({
      where: { id: result.merchant!.id },
      include: { users: true },
    });
    expect(merchant).not.toBeNull();
    expect(merchant!.businessName).toBeNull();
    expect(merchant!.merchantName).toBeNull();
    expect(merchant!.phone).toBeNull();

    const owner = merchant!.users[0];
    expect(owner.role).toBe("MERCHANT_OWNER");
    expect(owner.status).toBe("ACTIVE");
    expect(owner.email).toBe(email.toLowerCase());
    // Never store plaintext.
    expect(owner.passwordHash).not.toBe("CorrectHorse1!");
    await expect(verifyPassword("CorrectHorse1!", owner.passwordHash)).resolves.toBe(true);
  });

  it("rejects a duplicate email", async () => {
    mockSessionState.user = superAdmin;
    const email = `dup-${Date.now()}@test.local`;

    const first = await createMerchantAction(
      { success: false },
      formData({ email, password: "CorrectHorse1!", confirmPassword: "CorrectHorse1!" }),
    );
    expect(first.success).toBe(true);
    createdMerchantIds.push(first.merchant!.id);

    const second = await createMerchantAction(
      { success: false },
      formData({ email, password: "AnotherPass1!", confirmPassword: "AnotherPass1!" }),
    );
    expect(second.success).toBe(false);
    expect(second.error).toMatch(/already exists/i);
  });

  it("rejects mismatched password confirmation", async () => {
    mockSessionState.user = superAdmin;
    const result = await createMerchantAction(
      { success: false },
      formData({
        email: `mismatch-${Date.now()}@test.local`,
        password: "CorrectHorse1!",
        confirmPassword: "DifferentPass1!",
      }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/do not match/i);
  });

  it("rejects creation by a non-super-admin", async () => {
    mockSessionState.user = {
      id: "some-merchant-owner",
      email: "owner@test.local",
      name: "Owner",
      role: "MERCHANT_OWNER",
      staffRole: null,
      merchantId: "irrelevant",
      merchantStatus: "ACTIVE",
    };
    await expect(
      createMerchantAction(
        { success: false },
        formData({ email: "x@test.local", password: "CorrectHorse1!", confirmPassword: "CorrectHorse1!" }),
      ),
    ).rejects.toThrow(/Forbidden/);
  });

  it("blocks a suspended merchant's dashboard/API access even though their data is preserved", async () => {
    mockSessionState.user = superAdmin;
    const email = `suspend-${Date.now()}@test.local`;
    const created = await createMerchantAction(
      { success: false },
      formData({ email, password: "CorrectHorse1!", confirmPassword: "CorrectHorse1!" }),
    );
    createdMerchantIds.push(created.merchant!.id);

    const suspendResult = await setMerchantStatusAction(created.merchant!.id, "SUSPENDED");
    expect(suspendResult.success).toBe(true);

    const merchant = await prisma.merchant.findUnique({ where: { id: created.merchant!.id } });
    expect(merchant!.status).toBe("SUSPENDED");

    // Server-side authorization must block merchant-scoped actions once suspended —
    // this is what the real login/middleware check also relies on.
    mockSessionState.user = {
      id: "suspended-owner",
      email,
      name: "Suspended Owner",
      role: "MERCHANT_OWNER",
      staffRole: null,
      merchantId: created.merchant!.id,
      merchantStatus: "SUSPENDED",
    };
    await expect(
      createShipmentAction(
        { success: false },
        formData({
          shipmentType: "Parcel",
          description: "x",
          service: "Standard",
          origin: "A",
          destination: "B",
          senderName: "S",
          senderAddress: "1",
          senderCity: "C",
          senderCountry: "US",
          recipientName: "R",
          recipientAddress: "2",
          recipientCity: "D",
          recipientCountry: "US",
        }),
      ),
    ).rejects.toThrow(/Forbidden/);
  });
});
