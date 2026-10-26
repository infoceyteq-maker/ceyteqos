"use client";

import { useActionState } from "react";

import { changePasswordAction, updateProfileAction } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";

function Feedback({ state }: { state: { error?: string; success?: string } | undefined }) {
  if (state?.error) {
    return (
      <p role="alert" className="neu-inset-sm rounded-2xl px-4 py-3 text-sm font-semibold text-danger">
        {state.error}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p role="status" className="neu-inset-sm rounded-2xl px-4 py-3 text-sm font-semibold text-success">
        {state.success}
      </p>
    );
  }
  return null;
}

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, formAction] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-bold text-navy">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={fullName}
            autoComplete="name"
            className="input-inset w-full rounded-full px-5 py-3 text-base font-medium"
          />
        </div>
        <div>
          <label htmlFor="emailDisplay" className="mb-2 block text-sm font-bold text-navy">
            Email address
          </label>
          <input
            id="emailDisplay"
            type="email"
            value={email}
            disabled
            className="input-inset w-full rounded-full px-5 py-3 text-base font-medium opacity-60"
          />
          <p className="mt-1.5 text-xs text-soft">
            Email changes are managed by the Super Master Admin.
          </p>
        </div>
      </div>
      <div className="sm:max-w-52">
        <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="currentPassword" className="mb-2 block text-sm font-bold text-navy">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="input-inset w-full rounded-full px-5 py-3 text-base font-medium"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="mb-2 block text-sm font-bold text-navy">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="input-inset w-full rounded-full px-5 py-3 text-base font-medium"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-navy">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="input-inset w-full rounded-full px-5 py-3 text-base font-medium"
          />
        </div>
      </div>
      <div className="sm:max-w-56">
        <SubmitButton pendingLabel="Changing…">Change password</SubmitButton>
      </div>
    </form>
  );
}
