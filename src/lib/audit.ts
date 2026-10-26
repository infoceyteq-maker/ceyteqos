import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, getUserAgent, hashIp } from "@/lib/api-helpers";

/**
 * Audit logging. Every security-relevant event is recorded with a hashed
 * IP (never the raw address) and the user agent:
 *   login | login_failed | otp_sent | otp_verified | otp_failed |
 *   logout | password_reset_requested | password_reset | password_changed
 *
 * Uses the service-role client so events can be recorded even when there
 * is no session yet (e.g. a failed login). Failures are swallowed — an
 * audit hiccup must never break authentication.
 */
export type AuditAction =
  | "login"
  | "login_failed"
  | "otp_sent"
  | "otp_verified"
  | "otp_failed"
  | "logout"
  | "password_reset_requested"
  | "password_reset"
  | "password_changed";

export async function logAudit(
  action: AuditAction,
  opts: {
    userId?: string | null;
    email?: string | null;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  try {
    const [ip, userAgent] = await Promise.all([getClientIp(), getUserAgent()]);
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      user_id: opts.userId ?? null,
      email: opts.email ?? null,
      action,
      ip_hash: hashIp(ip),
      user_agent: userAgent,
      metadata: opts.metadata ?? {},
    });
  } catch {
    // Intentionally silent — see module comment.
  }
}
