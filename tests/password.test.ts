import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateTempPassword } from "@/lib/password";

describe("password utilities", () => {
  it("hashes a password and verifies the correct plaintext against it", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
    await expect(verifyPassword("correct-horse-battery-staple", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("generates temp passwords of sufficient length and randomness", () => {
    const a = generateTempPassword();
    const b = generateTempPassword();
    expect(a.length).toBe(12);
    expect(a).not.toBe(b);
  });
});
