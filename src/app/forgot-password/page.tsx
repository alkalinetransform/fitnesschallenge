import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password?" subtitle="We’ll email you a reset link">
      <Card>
        <CardTitle>Reset password</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Enter the email you used to sign up. We&apos;ll send a link to choose a new password.
        </p>
        <ForgotPasswordForm />
        <p className="mt-4 text-center text-sm text-slate-400">
          <Link href="/login" className="text-brand-400 hover:text-brand-300">
            Back to log in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
