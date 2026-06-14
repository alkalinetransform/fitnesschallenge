import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Button } from "@/components/ui/button";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell title="Invalid link">
        <Card className="text-center">
          <CardTitle>Invalid link</CardTitle>
          <p className="mt-2 text-sm text-slate-400">
            This password reset link is not valid. Request a new one from the login page.
          </p>
          <Link href="/forgot-password" className="mt-4 inline-block">
            <Button>Request reset link</Button>
          </Link>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Squeeze the day">
      <Card>
        <CardTitle>New password</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Enter a new password for your account. Use at least 6 characters.
        </p>
        <ResetPasswordForm token={token} />
      </Card>
    </AuthShell>
  );
}
