/**
 * Simple in-memory token-bucket rate limiter for public, unauthenticated
 * endpoints (tracking lookup, contact-merchant form). Good enough for a
 * single-instance deployment; swap for a Redis-backed limiter (e.g.
 * Upstash) when running multiple instances behind a load balancer.
 */

type Bucket = { tokens: number; lastRefill: number };

const buckets = new Map<string, Bucket>();

const CAPACITY = 20;
const REFILL_INTERVAL_MS = 60_000; // refill window
const REFILL_AMOUNT = 20;

export function rateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  if (elapsed > REFILL_INTERVAL_MS) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + REFILL_AMOUNT);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0 };
  }

  bucket.tokens -= 1;
  return { allowed: true, remaining: bucket.tokens };
}

export function getClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
