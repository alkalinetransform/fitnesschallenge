import type { TeamScore } from "@/lib/scores";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const rankStyles: Record<number, string> = {
  1: "border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-amber-600/5",
  2: "border-slate-300/30 bg-gradient-to-r from-slate-400/15 to-slate-500/5",
  3: "border-orange-700/40 bg-gradient-to-r from-orange-800/20 to-orange-900/5",
};

function PodiumRow({
  rank,
  name,
  points,
  highlight,
  delay,
}: {
  rank: number;
  name: string;
  points: number;
  highlight?: boolean;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        "animate-fade-in-up flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300 hover:scale-[1.01]",
        highlight ? rankStyles[rank] ?? "border-white/10 bg-white/5" : "border-white/5 bg-slate-800/40",
        delay
      )}
    >
      <span className="flex items-center gap-3 font-medium text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-sm font-bold">
          #{rank}
        </span>
        {name}
      </span>
      <span className="font-display text-lg font-bold text-brand-400">{points} pts</span>
    </div>
  );
}

export function TeamPodium({
  teams,
  subtitle = "Total points — all weeks",
}: {
  teams: TeamScore[];
  subtitle?: string;
}) {
  return (
    <Card className="animate-fade-in-up">
      <CardTitle>Team standings</CardTitle>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-4 space-y-2">
        {teams.length === 0 ? (
          <p className="text-sm text-slate-500">No teams yet.</p>
        ) : (
          teams.map((team, i) => (
            <PodiumRow
              key={team.teamId}
              rank={i + 1}
              name={team.name}
              points={team.points}
              highlight={i < 3}
              delay={`stagger-${Math.min(i + 1, 6)}`}
            />
          ))
        )}
      </div>
    </Card>
  );
}

export function TeamRosterGrid({ teams }: { teams: TeamScore[] }) {
  if (teams.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 animate-fade-in-up">
      {teams.map((team, i) => (
        <Card key={team.teamId} className={`stagger-${Math.min(i + 1, 6)}`}>
          <div className="flex items-center justify-between">
            <CardTitle>{team.name}</CardTitle>
            <span className="text-sm font-bold text-brand-400">{team.points} pts</span>
          </div>
          <ul className="mt-3 space-y-2">
            {team.players.map((p, j) => (
              <li
                key={p.userId}
                className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2 text-sm transition hover:bg-slate-800/60"
              >
                <span className="text-slate-200">
                  <span className="text-slate-500 mr-2">#{j + 1}</span>
                  {p.name}
                </span>
                <span className="font-semibold text-brand-400">{p.points}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

export function AllTeamsLeaderboard({
  teams,
  podiumSubtitle,
}: {
  teams: TeamScore[];
  podiumSubtitle?: string;
}) {
  return (
    <div className="space-y-6">
      <TeamPodium teams={teams} subtitle={podiumSubtitle} />
      <TeamRosterGrid teams={teams} />
    </div>
  );
}
