"use client";

import { useTransition } from "react";
import { movePlayerToTeam } from "@/actions/teams";
import { Button } from "@/components/ui/button";

export function TeamMoveControl({
  userId,
  teams,
  pending: externalPending,
}: {
  userId: string;
  teams: { id: string; name: string }[];
  pending?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const isPending = pending || externalPending;

  if (teams.length === 0) return null;

  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const teamId = fd.get("teamId") as string;
        if (!teamId) return;
        startTransition(async () => {
          await movePlayerToTeam(fd);
        });
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <select
        name="teamId"
        defaultValue=""
        className="max-w-[120px] rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-white"
        aria-label="Select team"
      >
        <option value="" disabled>
          Team…
        </option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm" loading={isPending} className="shrink-0 text-xs">
        Move
      </Button>
    </form>
  );
}
