import "server-only";

import { createHash, createHmac } from "node:crypto";
import { headers } from "next/headers";

/**
 * Shared hardening for Server Actions / Route Handlers:
 *  - origin (CSRF) check on mutating requests
 *  - in-memory rate limiting per IP / per account
 *  - IP hashing for privacy-preserving audit logs
 *
 * Note on rate limiting: the store is per-process memory. On serverless
 * (Vercel) each instance has its own map, so treat this as a soft first
 * layer — Supabase Auth's own rate limits remain the hard backstop.
 * Swap for Upstash/Redis in a later phase if stricter limits are needed.
 */

/** Returns an error message if the request origin is not allowed. */
export async function assertSameOrigin(): Promise<string | null> {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return null; // same-origin navigations may omit Origin

  const host = h.get("host");
  const allowed = new Set<string>();
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) allowed.add(siteUrl.replace(/\/$/, ""));

  return allowed.has(origin) ? null : "Cross-origin request blocked.";
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function getUserAgent(): Promise<string> {
  const h = await headers();
  return (h.get("user-agent") ?? "unknown").slice(0, 300);
}

/** HMAC-SHA256 of the IP — audit logs never store raw IPs. */
export function hashIp(ip: string): string {
  const secret =
    process.env.AUDIT_IP_HASH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "ceyteq-dev-only-secret";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/* ── Rate limiting ───────────────────────────────────────────────────────── */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/**
 * Sliding-window check. Returns true when the caller is OVER the limit.
 * Records the hit when `record` is true (default).
 */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
  record = true,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  const over = bucket.hits.length >= limit;
  if (record && !over) bucket.hits.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup so the map cannot grow unbounded.
  if (buckets.size > 5000) {
    buckets.forEach((b, k) => {
      if (b.hits.every((t) => now - t > windowMs)) buckets.delete(k);
    });
  }
  return over;
}

/** Seconds until the oldest hit in the window expires (for cooldown UX). */
export function rateLimitRetryAfter(key: string, windowMs: number): number {
  const bucket = buckets.get(key);
  if (!bucket || bucket.hits.length === 0) return 0;
  const now = Date.now();
  const oldest = Math.min(...bucket.hits);
  return Math.max(0, Math.ceil((windowMs - (now - oldest)) / 1000));
}
