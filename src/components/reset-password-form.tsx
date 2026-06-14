"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { resetPasswordWithToken } from "@/actions/password";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="mt-6 space-y-4 text-center">
        <p className="text-sm text-emerald-400">Your password has been updated.</p>
        <Link href="/login">
          <Button className="w-full">Log in with new password</Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      action={(fd) => {
        setError(null);
        fd.set("token", token);
        startTransition(async () => {
          const result = await resetPasswordWithToken(fd);
          if ("error" in result && result.error) {
            setError(result.error);
          } else {
            setDone(true);
          }
        });
      }}
      className="mt-6 space-y-4"
    >
      <div>
        <Label htmlFor="password">New password</Label>
        <PasswordInput id="password" name="password" minLength={6} required />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" minLength={6} required />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Update password
      </Button>
    </form>
  );
}
