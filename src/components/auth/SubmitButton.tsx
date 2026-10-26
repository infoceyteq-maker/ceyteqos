"use client";

import { useFormStatus } from "react-dom";

/** Primary pill button that reflects the enclosing form's pending state. */
export function SubmitButton({
  children,
  pendingLabel = "Please wait…",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`btn-primary inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 font-display text-base font-bold tracking-wide ${className}`}
    >
      {pending ? (
        <>
          <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
