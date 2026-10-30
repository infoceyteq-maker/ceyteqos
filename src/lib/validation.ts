import { z } from "zod";

import { OTP_LENGTH, OTP_REGEX } from "@/lib/otp";

/** Shared Zod schemas — used on the server for every auth boundary. */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(128),
  /** Honeypot — must stay empty. Bots that fill it are rejected silently. */
  companyWebsite: z.string().max(0).optional().default(""),
});

export const otpSchema = z.object({
  email: emailSchema,
  token: z
    .string()
    .trim()
    .regex(OTP_REGEX, `Enter the ${OTP_LENGTH}-digit code.`),
});

export const resetRequestSchema = z.object({
  email: emailSchema,
  companyWebsite: z.string().max(0).optional().default(""),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password.").max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80)
    .regex(/^[\p{L}\p{M} .'-]+$/u, "Name contains invalid characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;

/* ── Restaurant submissions (public Digital Race intake) ─────────────────── */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^https?:\/\//i.test(v), {
    message: "URL must start with http:// or https://",
  });

export const restaurantSubmissionSchema = z.object({
  restaurant_name: z.string().trim().min(2, "Restaurant name is required.").max(160),
  contact_name: optionalText(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Enter a valid email address.",
    }),
  phone: optionalText(40),
  whatsapp: optionalText(40),
  address: optionalText(300),
  city: optionalText(120),
  country: optionalText(120),
  website: optionalUrl,
  google_maps_url: optionalUrl,
  cuisine_type: optionalText(120),
  branches_count: z.coerce.number().int().min(0).max(10000).optional(),
  message: optionalText(2000),
  source: optionalText(80),
  /** Honeypot — must stay empty. */
  companyWebsite: z.string().max(0).optional().default(""),
});

export type RestaurantSubmissionInput = z.infer<typeof restaurantSubmissionSchema>;
