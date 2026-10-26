"use client";

import { useActionState, useEffect, useState } from "react";

import { resendOtpAction, verifyOtpAction } from "@/app/auth/actions";
import { OtpInput } from "@/components/auth/OtpInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { ShieldIcon } from "@/components/icons";

const RESEND_COOLDOWN = 60; // seconds

export function VerifyForm({ email }: { email: string | null }) {
  const [state, formAction] = useActionState(verifyOtpAction, undefined);
  const [resendState, resendAction] = useActionState(resendOtpAction, undefined);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Restart the 60s cooldown whenever a fresh code is sent.
  useEffect(() => {
    if (resendState?.success) setCooldown(RESEND_COOLDOWN);
  }, [resendState]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3.5">
        <span className="neu-dark grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-radium-light">
          <ShieldIcon className="h-5.5 w-5.5" />
        </span>
        <p className="text-sm leading-relaxed text-body">
          We sent a 6-digit code to{" "}
          <strong className="font-bold text-navy">{email ?? "your email"}</strong>. It
          expires soon and can be used once. Check your spam folder if it
          doesn&apos;t arrive within a minute.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state?.error && (
          <p role="alert" className="neu-inset-sm rounded-2xl px-4 py-3 text-center text-sm font-semibold text-danger">
            {state.error}
          </p>
        )}

        <OtpInput autoSubmit />

        <SubmitButton pendingLabel="Checking code…">Verify &amp; continue</SubmitButton>
      </form>

      <div className="space-y-2 text-center">
        {resendState?.success && (
          <p role="status" className="text-sm font-semibold text-success">
            {resendState.success}
          </p>
        )}
        {resendState?.error && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {resendState.error}
          </p>
        )}
        <form action={resendAction}>
          <button
            type="submit"
            disabled={cooldown > 0}
            className="text-sm font-semibold text-blue-brand transition-colors hover:text-navy disabled:cursor-not-allowed disabled:text-soft"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      </div>
    </div>
  );
}
