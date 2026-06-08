"use client";

import { createChallenge } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { useState, useTransition } from "react";

export function AddChallengeForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Card id="add" className="animate-fade-in-up scroll-mt-24">
      <CardTitle>Add challenge</CardTitle>
      <form
        action={(fd) => {
          setError(null);
          startTransition(async () => {
            const result = await createChallenge(fd);
            if (result?.error) setError(result.error);
            else (document.getElementById("add-challenge-form") as HTMLFormElement)?.reset();
          });
        }}
        id="add-challenge-form"
        className="mt-4 grid gap-3 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Walk 10K steps" required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} required />
        </div>
        <div>
          <Label htmlFor="points">Points</Label>
          <Input id="points" name="points" type="number" min={1} defaultValue={10} required />
        </div>
        <div>
          <Label htmlFor="durationDays">Duration (days)</Label>
          <Input id="durationDays" name="durationDays" type="number" min={1} max={365} defaultValue={7} required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="startDate">Start date (optional)</Label>
          <Input id="startDate" name="startDate" type="date" />
        </div>
        {error && <p className="sm:col-span-2 text-sm text-red-400">{error}</p>}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending} size="lg" loading={pending} className="w-full sm:w-auto">
            Add challenge
          </Button>
        </div>
      </form>
    </Card>
  );
}
