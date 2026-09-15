// Simple in-memory limiter for the login route — resets on server restart
// and isn't shared across serverless instances, but that's an accepted
// tradeoff for "slow down brute-force attempts", not a full auth-security
// overhaul.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_TRACKED_KEYS = 10_000; // opportunistic cap so this can't grow unbounded

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

function isExpired(bucket: Bucket, now: number): boolean {
  return now - bucket.windowStart > WINDOW_MS;
}

function pruneExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (isExpired(bucket, now)) buckets.delete(key);
  }
}

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || isExpired(bucket, now)) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count < MAX_ATTEMPTS) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000),
  };
}

export function recordFailedLoginAttempt(key: string): void {
  const now = Date.now();
  if (buckets.size > MAX_TRACKED_KEYS) pruneExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || isExpired(bucket, now)) {
    buckets.set(key, { count: 1, windowStart: now });
    return;
  }
  bucket.count += 1;
}

interface HeadersLike {
  get(name: string): string | null;
}

// Accepts either a real Request's `.headers` (in authorize(), called for
// every credential check regardless of entry path) or next/headers()'s
// result (in the authenticate() server action) — same shape, either works.
export function getClientIp(headers: HeadersLike): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
