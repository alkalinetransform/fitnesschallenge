"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/actions/password";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setError(null);
        setSuccess(false);
        startTransition(async () => {
          const result = await changePassword(fd);
          if ("error" in result && result.error) {
            setError(result.error);
          } else {
            setSuccess(true);
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput id="currentPassword" name="currentPassword" required />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput id="newPassword" name="newPassword" minLength={6} required />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" minLength={6} required />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-400">Password updated successfully.</p>
      )}
      <Button type="submit" size="sm" loading={pending}>
        Change password
      </Button>
    </form>
  );
}
