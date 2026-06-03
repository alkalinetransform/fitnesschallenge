"use client";

import { useState, useTransition } from "react";
import { registerPlayer } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlayerRegisterForm({
  gym,
}: {
  gym: { id: string; name: string; location: string };
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardTitle>Join as a player</CardTitle>
      <p className="mt-2 text-sm text-slate-400">
        Registering for <span className="font-medium text-white">{gym.name}</span>
        {gym.location ? ` · ${gym.location}` : ""}
      </p>
      <form
        action={(fd) => {
          setError(null);
          fd.set("gymId", gym.id);
          startTransition(async () => {
            const result = await registerPlayer(fd);
            if (result?.error) setError(result.error);
          });
        }}
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="gymId" value={gym.id} />
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={6} required />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" size="lg" loading={pending}>
          Create account
        </Button>
      </form>
    </Card>
  );
}
