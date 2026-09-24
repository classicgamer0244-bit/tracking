import { describe, it, expect } from "vitest";
import { generateTrackingNumber, generateMerchantCode } from "@/lib/tracking-number";

describe("identifier generators", () => {
  it("generates tracking numbers with the STK- prefix and no ambiguous characters", () => {
    const num = generateTrackingNumber();
    expect(num).toMatch(/^STK-[A-Z2-9]{10}$/);
    expect(num).not.toMatch(/[01OI]/);
  });

  it("generates merchant codes with the MCH- prefix", () => {
    const code = generateMerchantCode();
    expect(code).toMatch(/^MCH-[A-Z2-9]{6}$/);
  });

  it("generates unique values across many calls", () => {
    const values = new Set(Array.from({ length: 200 }, () => generateTrackingNumber()));
    expect(values.size).toBe(200);
  });
});
