"use client";

import { useState, useTransition } from "react";
import { previewTeams, generateTeams } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTeamLabel } from "@/lib/team-icons";

type PreviewTeam = {
  name: string;
  icon?: string;
  players: { id: string; name: string }[];
};

export function TeamGenerator({ playerCount }: { playerCount: number }) {
  const [teamCount, setTeamCount] = useState(4);
  const [preview, setPreview] = useState<PreviewTeam[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handlePreview() {
    setError(null);
    startTransition(async () => {
      const result = await previewTeams(teamCount);
      if ("error" in result && result.error) {
        setError(result.error);
        setPreview(null);
      } else if ("preview" in result && result.preview) {
        setPreview(result.preview);
      }
    });
  }

  function handleGenerate() {
    setError(null);
    const fd = new FormData();
    fd.set("teamCount", String(teamCount));
    startTransition(async () => {
      const result = await generateTeams(fd);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setPreview(null);
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="animate-fade-in-up">
        <CardTitle>Generate random teams</CardTitle>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-semibold text-white">{playerCount}</span> players registered.
          Teams shuffle and split evenly. Regenerating replaces all teams.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="teamCount">Number of teams</Label>
            <Input
              id="teamCount"
              type="number"
              min={1}
              max={50}
              value={teamCount}
              onChange={(e) => setTeamCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
              className="w-28"
            />
          </div>
          <Button type="button" variant="outline" size="lg" onClick={handlePreview} disabled={pending}>
            Preview split
          </Button>
          <Button type="button" size="lg" onClick={handleGenerate} disabled={pending || playerCount < 1}>
            Confirm & generate
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </Card>

      {preview && (
        <div className="grid animate-fade-in gap-4 sm:grid-cols-2">
          {preview.map((team, i) => (
            <Card key={team.name} className={`animate-scale-in stagger-${Math.min(i + 1, 6)}`}>
              <CardTitle>{formatTeamLabel(team.name, team.icon)}</CardTitle>
              <ul className="mt-3 space-y-2">
                {team.players.length === 0 ? (
                  <li className="text-sm text-slate-500">No players</li>
                ) : (
                  team.players.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      {p.name}
                    </li>
                  ))
                )}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
