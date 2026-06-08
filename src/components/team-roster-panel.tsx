"use client";

import { useMemo, useState, useTransition } from "react";
import { removePlayerFromTeam } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamMoveControl } from "@/components/team-move-control";

type TeamOption = { id: string; name: string };

export function TeamRosterPanel({
  teamName,
  members,
  otherTeams,
}: {
  teamName: string;
  members: { userId: string; name: string }[];
  otherTeams: TeamOption[];
}) {
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [members, search]);

  return (
    <div className="mt-3">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search players…"
        className="mb-2 border-brand-500/20 bg-slate-950/30"
      />
      <ul className="scrollbar-brand max-h-[176px] space-y-2 overflow-y-auto scroll-smooth pr-1">
        {filtered.length === 0 ? (
          <li className="text-sm text-slate-500">No players match.</li>
        ) : (
          filtered.map((m) => (
            <li
              key={m.userId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-500/15 bg-gradient-to-r from-brand-500/10 to-transparent px-3 py-2 text-sm"
            >
              <span className="font-medium text-white">{m.name}</span>
              <div className="flex flex-wrap items-center gap-1">
                {otherTeams.length > 0 && (
                  <TeamMoveControl userId={m.userId} teams={otherTeams} pending={pending} />
                )}
                <form
                  action={(fd) => {
                    startTransition(async () => {
                      await removePlayerFromTeam(fd);
                    });
                  }}
                >
                  <input type="hidden" name="userId" value={m.userId} />
                  <Button type="submit" variant="ghost" size="sm" className="text-xs text-red-400">
                    Unassign
                  </Button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
      <p className="mt-1 text-[10px] text-slate-500">{teamName} · scroll to browse</p>
    </div>
  );
}
