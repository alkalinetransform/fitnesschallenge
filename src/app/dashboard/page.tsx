import { requirePlayerGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPlayerScoresTotal, getTeamScoresTotal } from "@/lib/scores";
import { Card, CardTitle } from "@/components/ui/card";
import { ChallengeCheckbox } from "@/components/challenge-checkbox";
import { StatCard } from "@/components/stat-card";
import { CompetitionStatusBanner } from "@/components/competition-status-banner";
import { TeamRosterGrid } from "@/components/leaderboard-podium";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { session, gym } = await requirePlayerGym();
  const now = new Date();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { endMetricsSentAt: true },
  });

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
  const awaitingResults =
    locked && gym.endPhase === "AWAITING_METRICS" && !user.endMetricsSentAt;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
          {gym.competitionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-white">{gym.name}</h1>
        <p className="text-sm text-slate-400">
          {locked ? "Competition ended" : `Week ${gym.activeWeek}`}
          {member ? ` · ${member.team.name}` : ""}
        </p>
      </div>

      {!locked && !member && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          You&apos;re not assigned to a team yet — don&apos;t worry, you&apos;ll be placed on a team
          soon!
        </div>
      )}

      {awaitingResults && (
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-4 text-center text-sm text-brand-100">
          The Transformation Challenge ended! Awaiting updated data…
        </div>
      )}

      {locked && !awaitingResults && (
        <CompetitionStatusBanner
          ended
          endedAt={gym.endedAt}
          topPlayer={myScore && myScore.points > 0 ? myScore : null}
        />
      )}

      {!locked && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Your points" value={myScore?.points ?? 0} accent="orange" delay="stagger-2" />
            <StatCard
              label="Team points"
              value={member ? teamPoints : "—"}
              accent="emerald"
              delay="stagger-3"
            />
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
                        "flex gap-3 rounded-xl border p-3 transition-all duration-300",
                        done ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-slate-800/30"
                      )}
                    >
                      <ChallengeCheckbox
                        challengeId={c.id}
                        challengeName={c.name}
                        defaultChecked={done}
                        disabled={locked}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.description}</p>
                        <span className="mt-1 inline-block text-xs font-bold text-brand-400">
                          +{c.points} pts · {c.durationDays}d
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
        </>
      )}
    </div>
  );
}
