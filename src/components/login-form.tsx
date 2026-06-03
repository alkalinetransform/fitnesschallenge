"use client";

import { useState, useTransition } from "react";
import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const result = await loginUser(fd);
          if (result?.error) setError(result.error);
        });
      }}
      className="mt-6 space-y-4"
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Log in
      </Button>
    </form>
  );
}
