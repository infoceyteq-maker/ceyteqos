"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { signInAction } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";

export function LoginForm({ resetDone = false }: { resetDone?: boolean }) {
  const [state, formAction] = useActionState(signInAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {resetDone && (
        <p role="status" className="neu-inset-sm rounded-2xl px-4 py-3 text-sm font-semibold text-success">
          Your password has been reset. Sign in with your new password.
        </p>
      )}

      {state?.error && (
        <p role="alert" className="neu-inset-sm rounded-2xl px-4 py-3 text-sm font-semibold text-danger">
          {state.error}
        </p>
      )}

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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-bold text-navy">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-blue-brand transition-colors hover:text-navy"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-radium">
            <LockIcon className="h-5 w-5" />
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Your password"
            className="input-inset w-full rounded-full py-3.5 pl-12 pr-13 text-base font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-soft transition-colors hover:text-navy"
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Honeypot — real humans never see or fill this. */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Company website
          <input name="company-website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <SubmitButton pendingLabel="Verifying credentials…">
        Sign in
        <ArrowRightIcon className="h-5 w-5" />
      </SubmitButton>

      <p className="text-center text-xs leading-relaxed text-soft">
        Protected by two-step verification — after your password, we email a
        6-digit code to confirm it&apos;s really you.
      </p>
    </form>
  );
}
