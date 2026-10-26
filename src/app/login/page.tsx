import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to the Ceyteq General Management System."
    >
      <LoginForm resetDone={reset === "1"} />
    </AuthShell>
  );
}
