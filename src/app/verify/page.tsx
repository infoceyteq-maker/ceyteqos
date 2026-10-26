import type { Metadata } from "next";
import { cookies } from "next/headers";

import { signOutAction } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyForm } from "@/components/auth/VerifyForm";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyPage() {
  const store = await cookies();
  const email = store.get("ceyteq-pending-email")?.value ?? null;

  return (
    <AuthShell
      title="Check your email"
      subtitle="Step 2 of 2 — confirm the code to finish signing in."
    >
      <VerifyForm email={email} />
      <form action={signOutAction.bind(null, "local")} className="mt-6 text-center">
        <button
          type="submit"
          className="text-sm font-semibold text-blue-brand transition-colors hover:text-navy"
        >
          Use a different account
        </button>
      </form>
    </AuthShell>
  );
}
