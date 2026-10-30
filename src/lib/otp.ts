/**
 * Email OTP configuration.
 *
 * Code length: Supabase controls how many digits the emailed code has
 * (Dashboard → Authentication → Providers → Email → "OTP length").
 * The shared Ceyteq Supabase instance this app deploys against is set to
 * 8, so production sets NEXT_PUBLIC_OTP_LENGTH=8. The digit boxes,
 * validation and UI copy all read from here.
 *
 * Second factor switch: sign-in can require the emailed code as a second
 * step (password → /verify → dashboard) or go straight to the dashboard
 * after the password check. The OTP step only works end-to-end when BOTH
 * of these are true in the Supabase project:
 *   1. The "Magic Link" email template contains {{ .Token }} (sends a
 *      code, not a link), and
 *   2. Custom SMTP is configured (the built-in mailer is limited to
 *      ~2 emails/hour, which locks staff out after a couple of logins).
 * Until both are in place, keep NEXT_PUBLIC_REQUIRE_EMAIL_OTP unset (or
 * "false") so the owner can always sign in with email + password.
 * Set it to "true" to re-enable the /verify step — no code change needed.
 * Password *reset* always uses an emailed code, regardless of this flag.
 */
const parsed = Number.parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH ?? "6", 10);

export const OTP_LENGTH =
  Number.isFinite(parsed) ? Math.min(10, Math.max(6, parsed)) : 6;

export const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);

/** True only when NEXT_PUBLIC_REQUIRE_EMAIL_OTP is exactly "true". */
export const REQUIRE_EMAIL_OTP =
  process.env.NEXT_PUBLIC_REQUIRE_EMAIL_OTP === "true";
