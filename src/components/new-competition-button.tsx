"use client";

import { useTransition } from "react";
import { startNewCompetition } from "@/actions/gym";
import { Button } from "@/components/ui/button";

export function NewCompetitionButton() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="tile-orange flex flex-col gap-3 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-lg font-bold text-white">No active competition</p>
        <p className="mt-1 text-sm text-slate-400">Create new competition</p>
        <p className="mt-1 text-sm text-slate-500">Unlock scoring and add challenges again.</p>
      </div>
      <Button
        type="button"
        size="lg"
        loading={pending}
        className="shrink-0"
        onClick={() => {
          const ok = window.confirm(
            "Start a new competition?\n\nThis unlocks scoring and lets you add new challenges. Previous challenge history stays in the archive."
          );
          if (!ok) return;
          startTransition(async () => {
            await startNewCompetition();
            window.location.reload();
          });
        }}
      >
        New competition
      </Button>
    </div>
  );
}
