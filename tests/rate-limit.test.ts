import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("allows requests under the capacity and blocks once exhausted", () => {
    const key = `test-${Math.random()}`;
    let lastResult;
    for (let i = 0; i < 20; i++) {
      lastResult = rateLimit(key);
      expect(lastResult.allowed).toBe(true);
    }
    const blocked = rateLimit(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks separate buckets per key", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    for (let i = 0; i < 20; i++) rateLimit(keyA);
    expect(rateLimit(keyA).allowed).toBe(false);
    expect(rateLimit(keyB).allowed).toBe(true);
  });
});
