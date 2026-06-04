"use client";

import { useState, useTransition } from "react";
import { startNewCompetitionWithTeams } from "@/actions/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewCompetitionDialog({ playerCount }: { playerCount: number }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <div className="tile-orange flex flex-col gap-3 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-white">No active competition</p>
          <p className="mt-1 text-sm text-slate-400">Start a new transformation challenge</p>
        </div>
        <Button type="button" size="lg" onClick={() => setOpen(true)}>
          New competition
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6">
        <h2 className="font-display text-lg font-bold text-white">New competition</h2>
        <p className="mt-1 text-sm text-slate-400">
          Name your challenge and generate teams from your player roster ({playerCount} players).
        </p>
        <form
          className="mt-4 space-y-4"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const result = await startNewCompetitionWithTeams(fd);
              if (result?.error) setError(result.error);
              else window.location.href = "/admin";
            });
          }}
        >
          <div>
            <Label htmlFor="competitionName">Competition name</Label>
            <Input
              id="competitionName"
              name="competitionName"
              defaultValue="Transformation Challenge"
              required
            />
          </div>
          <div>
            <Label htmlFor="teamCount">Number of teams</Label>
            <Input
              id="teamCount"
              name="teamCount"
              type="number"
              min={1}
              max={Math.max(playerCount, 1)}
              defaultValue={Math.min(4, Math.max(playerCount, 1))}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" loading={pending}>
              Start & generate teams
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
