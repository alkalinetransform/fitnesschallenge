"use client";

import { useState, useTransition } from "react";
import { renameTeam } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { TeamRosterPanel } from "@/components/team-roster-panel";
import { TeamMoveControl } from "@/components/team-move-control";
import { formatTeamLabel } from "@/lib/team-icons";
import { cn } from "@/lib/utils";

type TeamData = {
  id: string;
  name: string;
  icon: string;
  members: { userId: string; name: string }[];
};

type Player = { id: string; name: string; teamId: string | null };

function TeamCardInner({
  team,
  otherTeams,
  pending,
  onRename,
}: {
  team: TeamData;
  otherTeams: { id: string; name: string }[];
  pending: boolean;
  onRename: (fd: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = formatTeamLabel(team.name, team.icon);

  return (
    <Card className="border-brand-500/15 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-white/5"
          aria-expanded={open}
        >
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs text-slate-300 transition",
              open && "rotate-180"
            )}
          >
            ▼
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold text-white">{label}</p>
            <p className="text-xs text-slate-500">
              {team.members.length} player{team.members.length === 1 ? "" : "s"}
            </p>
          </div>
        </button>
        <form action={onRename} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="teamId" value={team.id} />
          <Input name="name" defaultValue={team.name} className="max-w-[120px] py-1.5 text-sm" />
          <Button type="submit" variant="outline" size="sm" loading={pending}>
            Rename
          </Button>
        </form>
      </div>

      {open && (
        <div className="mt-3 border-t border-white/5 pt-3 animate-fade-in">
          <TeamRosterPanel teamName={team.name} members={team.members} otherTeams={otherTeams} />
        </div>
      )}
    </Card>
  );
}

export function TeamEditor({
  teams,
  unassigned,
}: {
  teams: TeamData[];
  unassigned: Player[];
}) {
  const [pending, startTransition] = useTransition();
  const allTeams = teams.map((t) => ({
    id: t.id,
    name: formatTeamLabel(t.name, t.icon),
  }));

  const handleRename = (fd: FormData) => {
    startTransition(async () => {
      await renameTeam(fd);
    });
  };

  return (
    <div className="space-y-4">
      {unassigned.length > 0 && (
        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardTitle>Unassigned players ({unassigned.length})</CardTitle>
          <ul className="mt-3 max-h-[176px] space-y-2 overflow-y-auto scroll-smooth pr-1 scrollbar-brand">
            {unassigned.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-slate-900/40 px-3 py-2 text-sm"
              >
                <span className="font-medium text-white">{p.name}</span>
                <TeamMoveControl userId={p.id} teams={allTeams} pending={pending} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {teams.map((team) => {
        const otherTeams = teams
          .filter((t) => t.id !== team.id)
          .map((t) => ({ id: t.id, name: formatTeamLabel(t.name, t.icon) }));
        return (
          <TeamCardInner
            key={team.id}
            team={team}
            otherTeams={otherTeams}
            pending={pending}
            onRename={handleRename}
          />
        );
      })}
    </div>
  );
}
