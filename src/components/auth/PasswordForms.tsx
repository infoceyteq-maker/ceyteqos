"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { requestPasswordResetAction, resetPasswordAction } from "@/app/auth/actions";
import { OtpInput } from "@/components/auth/OtpInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";

/* ── Step 1: request the reset code ──────────────────────────────────────── */

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, undefined);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.error && (
        <p role="alert" className="neu-inset-sm rounded-2xl px-4 py-3 text-sm font-semibold text-danger">
          {state.error}
        </p>
      )}

      <p className="text-sm leading-relaxed text-body">
        Enter your account email. If an account exists for it, we&apos;ll send a
        6-digit reset code.
      </p>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold text-navy">
          Email address
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-radium">
            <MailIcon className="h-5 w-5" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            placeholder="you@ceyteq.com"
            className="input-inset w-full rounded-full py-3.5 pl-12 pr-5 text-base font-medium"
          />
        </div>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label>
          Company website
          <input name="company-website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <SubmitButton pendingLabel="Sending code…">Send reset code</SubmitButton>

      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-blue-brand hover:text-navy">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

/* ── Step 2: code + new password ─────────────────────────────────────────── */

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-navy">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-radium">
          <LockIcon className="h-5 w-5" />
        </span>
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          placeholder="At least 8 characters"
          className="input-inset w-full rounded-full py-3.5 pl-12 pr-13 text-base font-medium"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-soft transition-colors hover:text-navy"
        >
          {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, undefined);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.error && (
        <p role="alert" className="neu-inset-sm rounded-2xl px-4 py-3 text-center text-sm font-semibold text-danger">
          {state.error}
        </p>
      )}

      <p className="text-center text-sm leading-relaxed text-body">
        Enter the 6-digit code from your email, then choose a new password.
      </p>

      <OtpInput />

      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
      />

      <SubmitButton pendingLabel="Updating password…">Reset password</SubmitButton>

      <p className="text-center text-sm">
        <Link href="/forgot-password" className="font-semibold text-blue-brand hover:text-navy">
          Request a new code
        </Link>
      </p>
    </form>
  );
}
