/**
 * Email OTP code length.
 *
 * Supabase controls how many digits the emailed code has
 * (Dashboard → Authentication → Providers → Email → "OTP length").
 * A dedicated project defaults to 6; the shared Ceyteq Supabase instance
 * is configured to 8, so production sets NEXT_PUBLIC_OTP_LENGTH=8.
 * The digit boxes, validation and UI copy all read from here.
 */
const parsed = Number.parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH ?? "6", 10);

export const OTP_LENGTH =
  Number.isFinite(parsed) ? Math.min(10, Math.max(6, parsed)) : 6;

export const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);
