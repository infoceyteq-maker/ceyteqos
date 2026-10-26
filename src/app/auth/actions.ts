"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  assertSameOrigin,
  getClientIp,
  isRateLimited,
} from "@/lib/api-helpers";
import { logAudit } from "@/lib/audit";
import {
  changePasswordSchema,
  loginSchema,
  otpSchema,
  profileUpdateSchema,
  resetPasswordSchema,
  resetRequestSchema,
} from "@/lib/validation";

/* ── Shared types & constants ────────────────────────────────────────────── */

export interface AuthFormState {
  error?: string;
  success?: string;
}

const PENDING_EMAIL_COOKIE = "ceyteq-pending-email"; // display-only (which inbox)
const RESET_EMAIL_COOKIE = "ceyteq-reset-email"; // httpOnly, read server-side

const GENERIC_CREDENTIAL_ERROR = "Invalid email or password.";
const GENERIC_OTP_ERROR = "That code is invalid or has expired. Please try again.";
const RATE_LIMIT_ERROR = "Too many attempts. Please wait a few minutes and try again.";

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

async function setCookie(name: string, value: string, maxAge: number, httpOnly: boolean) {
  const store = await cookies();
  store.set(name, value, {
    httpOnly,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

async function clearCookie(name: string) {
  const store = await cookies();
  store.set(name, "", { path: "/", maxAge: 0 });
}

/* ── Step 1: email + password ────────────────────────────────────────────── */

export async function signInAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const originError = await assertSameOrigin();
  if (originError) return { error: originError };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    companyWebsite: formData.get("company-website") ?? "",
  });

  // Honeypot tripped or malformed input → identical generic error.
  if (!parsed.success) return { error: GENERIC_CREDENTIAL_ERROR };

  const { email, password } = parsed.data;
  const ip = await getClientIp();

  if (
    isRateLimited(`login:ip:${ip}`, 10, FIFTEEN_MIN) ||
    isRateLimited(`login:email:${email}`, 5, FIFTEEN_MIN)
  ) {
    return { error: RATE_LIMIT_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await logAudit("login_failed", { email });
    return { error: GENERIC_CREDENTIAL_ERROR };
  }

  // Credentials are valid. Enforce account status (Phase 1: seeded admin).
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile && profile.status !== "active") {
    await supabase.auth.signOut();
    await logAudit("login_failed", {
      userId: data.user.id,
      email,
      metadata: { reason: `status:${profile.status}` },
    });
    return { error: "This account is not active. Please contact your administrator." };
  }

  // The password session is a *pre-OTP* session. Clear any previous
  // second-factor flag so the OTP step can never be skipped, then email
  // a fresh 6-digit code. Middleware blocks /dashboard until verified.
  await supabase.auth.updateUser({ data: { mfa_verified_at: null } });

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (otpError) {
    await logAudit("otp_failed", {
      userId: data.user.id,
      email,
      metadata: { reason: "send_failed" },
    });
    return {
      error: "We couldn't send your verification code. Please try again shortly.",
    };
  }

  await logAudit("otp_sent", { userId: data.user.id, email, metadata: { purpose: "login" } });
  await setCookie(PENDING_EMAIL_COOKIE, email, 10 * 60, false);

  redirect("/verify");
}

/* ── Step 2: 6-digit email OTP ───────────────────────────────────────────── */

export async function verifyOtpAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const originError = await assertSameOrigin();
  if (originError) return { error: originError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No pre-OTP session → restart the flow.
  if (!user?.email) redirect("/login");

  const parsed = otpSchema.safeParse({ email: user.email, token: formData.get("token") });
  if (!parsed.success) return { error: GENERIC_OTP_ERROR };

  if (isRateLimited(`otp:verify:${user.email}`, 10, FIFTEEN_MIN)) {
    return { error: RATE_LIMIT_ERROR };
  }

  const { error } = await supabase.auth.verifyOtp({
    email: user.email,
    token: parsed.data.token,
    type: "email",
  });

  if (error) {
    await logAudit("otp_failed", { userId: user.id, email: user.email });
    return { error: GENERIC_OTP_ERROR };
  }

  // Mark the session as second-factor verified, then open the dashboard.
  await supabase.auth.updateUser({ data: { mfa_verified_at: new Date().toISOString() } });
  await logAudit("otp_verified", { userId: user.id, email: user.email });
  await logAudit("login", { userId: user.id, email: user.email });
  await clearCookie(PENDING_EMAIL_COOKIE);

  redirect("/dashboard");
}

/** Resend the login OTP. 60s cooldown is enforced in the UI; 3/hour here. */
export async function resendOtpAction(
  _prev: AuthFormState | undefined,
): Promise<AuthFormState> {
  const originError = await assertSameOrigin();
  if (originError) return { error: originError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  if (isRateLimited(`otp:resend:${user.email}`, 3, ONE_HOUR)) {
    return { error: "You've requested too many codes. Please try again later." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  });

  if (error) return { error: "Couldn't resend the code. Please try again shortly." };

  await logAudit("otp_sent", { userId: user.id, email: user.email, metadata: { purpose: "login", resend: true } });
  return { success: "A new code is on its way to your inbox." };
}

/* ── Forgot / reset password (same email-OTP mechanism) ─────────────────── */

export async function requestPasswordResetAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const originError = await assertSameOrigin();
  if (originError) return { error: originError };

  const parsed = resetRequestSchema.safeParse({
    email: formData.get("email"),
    companyWebsite: formData.get("company-website") ?? "",
  });

  // Always behave identically whether the account exists or not.
  if (!parsed.success) return { error: "Enter a valid email address." };

  const { email } = parsed.data;
  const ip = await getClientIp();

  if (
    isRateLimited(`reset:ip:${ip}`, 5, FIFTEEN_MIN) ||
    isRateLimited(`reset:email:${email}`, 3, ONE_HOUR)
  ) {
    return { error: RATE_LIMIT_ERROR };
  }

  const supabase = await createClient();
  // shouldCreateUser:false → codes are only sent to real accounts.
  await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });

  await logAudit("password_reset_requested", { email });
  await setCookie(RESET_EMAIL_COOKIE, email, 15 * 60, true);

  redirect("/reset-password");
}

/** Verify the reset code and set the new password in one step. */
export async function resetPasswordAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const originError = await assertSameOrigin();
  if (originError) return { error: originError };

  const store = await cookies();
  const email = store.get(RESET_EMAIL_COOKIE)?.value;
  if (!email) redirect("/forgot-password");

  const otp = otpSchema.safeParse({ email, token: formData.get("token") });
  if (!otp.success) return { error: GENERIC_OTP_ERROR };

  const pw = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!pw.success) {
    return { error: pw.error.issues[0]?.message ?? "Please check the new password." };
  }

  if (isRateLimited(`otp:verify:${email}`, 10, FIFTEEN_MIN)) {
    return { error: RATE_LIMIT_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp.data.token,
    type: "email",
  });

  if (error || !data.user) {
    await logAudit("otp_failed", { email, metadata: { purpose: "reset" } });
    return { error: GENERIC_OTP_ERROR };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: pw.data.password,
    data: { mfa_verified_at: null },
  });

  if (updateError) {
    return { error: "Couldn't update your password. Please try again." };
  }

  await logAudit("password_reset", { userId: data.user.id, email });
  await clearCookie(RESET_EMAIL_COOKIE);

  // Sign out everywhere — the user signs in fresh with the new password.
  await supabase.auth.signOut({ scope: "global" }).catch(() => undefined);
  redirect("/login?reset=1");
}

/* ── Sign out ────────────────────────────────────────────────────────────── */

export async function signOutAction(
  scope: "local" | "global" = "local",
  // Present when bound as a <form action={signOutAction.bind(null, scope)}>.
  _formData?: FormData,
) {
  void _formData;
  const originError = await assertSameOrigin();
  if (originError) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Next sign-in must complete the OTP step again.
    await supabase.auth.updateUser({ data: { mfa_verified_at: null } }).catch(() => undefined);
    await logAudit("logout", { userId: user.id, email: user.email, metadata: { scope } });
  }

  await supabase.auth.signOut({ scope }).catch(() => undefined);
  await clearCookie(PENDING_EMAIL_COOKIE);
  redirect("/login");
}

/* ── Settings: profile + password ────────────────────────────────────────── */

export async function updateProfileAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const originError = await assertSameOrigin();
  if (originError) return { error: originError };

  const parsed = profileUpdateSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", user.id);

  if (error) return { error: "Couldn't save your profile. Please try again." };

  await supabase.auth.updateUser({ data: { full_name: parsed.data.fullName } });
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const originError = await assertSameOrigin();
  if (originError) return { error: originError };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  if (isRateLimited(`pwchange:${user.id}`, 5, FIFTEEN_MIN)) {
    return { error: RATE_LIMIT_ERROR };
  }

  // Re-authenticate with the current password before allowing the change.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) return { error: "Your current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) return { error: "Couldn't change your password. Please try again." };

  await logAudit("password_changed", { userId: user.id, email: user.email });
  return { success: "Password changed successfully." };
}
