"use client";

import { useTransition } from "react";
import { renameTeam } from "@/actions/teams";
import { movePlayerToTeam } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { TeamRosterPanel } from "@/components/team-roster-panel";

type TeamData = {
  id: string;
  name: string;
  members: { userId: string; name: string }[];
};

type Player = { id: string; name: string; teamId: string | null };

export function TeamEditor({
  teams,
  unassigned,
}: {
  teams: TeamData[];
  unassigned: Player[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {teams.map((team) => {
        const otherTeams = teams.filter((t) => t.id !== team.id).map((t) => ({ id: t.id, name: t.name }));
        return (
          <Card key={team.id} className="border-brand-500/15">
            <form
              action={(fd) => {
                startTransition(async () => {
                  await renameTeam(fd);
                });
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="teamId" value={team.id} />
              <CardTitle className="flex-1">{team.name}</CardTitle>
              <Input name="name" defaultValue={team.name} className="max-w-[160px] py-2" />
              <Button type="submit" variant="outline" size="md" loading={pending}>
                Rename
              </Button>
            </form>
            <TeamRosterPanel
              teamName={team.name}
              members={team.members}
              otherTeams={otherTeams}
            />
          </Card>
        );
      })}

      {unassigned.length > 0 && (
        <Card className="border-brand-500/15">
          <CardTitle>Unassigned players</CardTitle>
          <ul className="mt-3 max-h-[176px] space-y-2 overflow-y-auto scroll-smooth pr-1">
            {unassigned.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-500/15 bg-gradient-to-r from-brand-500/10 to-transparent px-3 py-2 text-sm"
              >
                <span className="flex-1 font-medium text-white">{p.name}</span>
                {teams.map((t) => (
                  <form
                    key={t.id}
                    action={(fd) => {
                      startTransition(async () => {
                        await movePlayerToTeam(fd);
                      });
                    }}
                  >
                    <input type="hidden" name="userId" value={p.id} />
                    <input type="hidden" name="teamId" value={t.id} />
                    <Button type="submit" variant="outline" size="sm" loading={pending} className="text-xs">
                      Add to {t.name}
                    </Button>
                  </form>
                ))}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
