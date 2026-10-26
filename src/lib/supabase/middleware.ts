import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session gate for every request.
 *
 * Rules enforced here (before any page renders):
 *  1. Refresh the Supabase session cookie when needed.
 *  2. /dashboard/* requires a signed-in user          → else /login.
 *  3. /dashboard/* also requires the email-OTP second factor
 *     (user_metadata.mfa_verified_at set by /verify)  → else /verify.
 *  4. Idle timeout: a session inactive for 30 minutes is signed out.
 *     Tracked with the `ceyteq-last-active` cookie, refreshed on activity.
 *  5. Signed-in users hitting /login are sent onward to /verify or
 *     /dashboard depending on their OTP state.
 */

const IDLE_COOKIE = "ceyteq-last-active";
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // absolute cap mirrors the refresh cookie (7 days)
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() revalidates the token with Supabase Auth — never
  // trust getSession() alone in server code for authorisation decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/verify" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const redirectTo = (dest: string) => {
    const url2 = request.nextUrl.clone();
    url2.pathname = dest;
    url2.search = "";
    const res = NextResponse.redirect(url2);
    // Preserve any cookie writes Supabase made during getUser().
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!user) {
    if (isDashboard) return redirectTo("/login");
    return response;
  }

  // ── Idle timeout (30 min) ────────────────────────────────────────────────
  const lastActiveRaw = request.cookies.get(IDLE_COOKIE)?.value;
  const lastActive = lastActiveRaw ? Number(lastActiveRaw) : NaN;
  const now = Date.now();

  if (Number.isFinite(lastActive) && now - lastActive > IDLE_TIMEOUT_MS) {
    await supabase.auth.signOut().catch(() => undefined);
    const res = redirectTo("/login");
    res.cookies.set(IDLE_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return res;
  }

  const otpVerified = Boolean(
    (user.user_metadata as Record<string, unknown> | undefined)?.mfa_verified_at,
  );

  // ── Route rules for signed-in users ──────────────────────────────────────
  if (isDashboard && !otpVerified) {
    response.cookies.set(IDLE_COOKIE, String(now), cookieOptions);
    const res = redirectTo("/verify");
    res.cookies.set(IDLE_COOKIE, String(now), cookieOptions);
    return res;
  }

  if (pathname === "/login") {
    return redirectTo(otpVerified ? "/dashboard" : "/verify");
  }

  if (pathname === "/verify" && otpVerified) {
    return redirectTo("/dashboard");
  }

  // Refresh the idle timer on genuine activity (pages + API mutations).
  if (isDashboard || isAuthPage || pathname.startsWith("/api/")) {
    response.cookies.set(IDLE_COOKIE, String(now), cookieOptions);
  }

  return response;
}
