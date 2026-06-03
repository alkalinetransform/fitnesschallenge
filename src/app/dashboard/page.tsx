import Link from "next/link";
import { requirePlayerGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPlayerScoresTotal, getTeamScoresTotal } from "@/lib/scores";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeCheckbox } from "@/components/challenge-checkbox";
import { StatCard } from "@/components/stat-card";
import { CompetitionStatusBanner } from "@/components/competition-status-banner";
import { TeamRosterGrid } from "@/components/leaderboard-podium";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { session, gym } = await requirePlayerGym();
  const now = new Date();

  const challenges = await prisma.challenge.findMany({
    where: {
      gymId: gym.id,
      startDate: { lte: now },
      expiresAt: { gt: now },
    },
    orderBy: { name: "asc" },
  });

  const completions = await prisma.completion.findMany({
    where: { userId: session.user.id },
    select: { challengeId: true },
  });
  const completedIds = new Set(completions.map((c) => c.challengeId));

  const member = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: { team: true },
  });

  const allScores = await getPlayerScoresTotal(gym.id);
  const myScore = allScores.find((p) => p.userId === session.user.id);
  const teams = await getTeamScoresTotal(gym.id);
  const teamPoints = member
    ? teams.find((t) => t.teamId === member.teamId)?.points ?? 0
    : 0;

  const locked = gym.challengeEnded;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
          Squeeze the day
        </p>
        <h1 className="font-display text-2xl font-bold text-white">{gym.name}</h1>
        <p className="text-sm text-slate-400">
          Week {gym.activeWeek}
          {member ? ` · ${member.team.name}` : ""}
        </p>
      </div>

      {locked && (
        <CompetitionStatusBanner
          ended
          endedAt={gym.endedAt}
          topPlayer={myScore && myScore.points > 0 ? myScore : null}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Your points" value={myScore?.points ?? 0} accent="orange" delay="stagger-2" />
        <StatCard label="Team points" value={member ? teamPoints : "—"} accent="emerald" delay="stagger-3" />
      </div>

      <Card>
        <CardTitle>Active challenges</CardTitle>
        <p className="mt-1 text-xs text-slate-500">Tasks in the current competition</p>
        {challenges.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No active challenges right now.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {challenges.map((c) => {
              const done = completedIds.has(c.id);
              return (
                <li
                  key={c.id}
                  className={cn(
                    "flex gap-3 rounded-xl border p-3 transition-all duration-300 hover:scale-[1.01]",
                    done ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-slate-800/30"
                  )}
                >
                  <ChallengeCheckbox
                    challengeId={c.id}
                    challengeName={c.name}
                    defaultChecked={done}
                    disabled={locked}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.description}</p>
                    <span className="mt-1 inline-block text-xs font-bold text-brand-400">
                      +{c.points} pts · {c.durationWeeks}wk
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-white">All teams</h2>
        <TeamRosterGrid teams={teams} />
      </div>

      <Link href="/leaderboard" className="block">
        <Button variant="outline" size="lg" className="w-full">
          Leaderboard →
        </Button>
      </Link>
    </div>
  );
}
