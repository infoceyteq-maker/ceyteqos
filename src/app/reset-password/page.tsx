import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password" subtitle="Use the code we emailed you.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
