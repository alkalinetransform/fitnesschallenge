import { requirePlayerGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { habitLabelsFromCompletions } from "@/lib/player-utils";
import { BodyMetricsDisplay } from "@/components/body-metrics-display";
import { TransformationWrap } from "@/components/transformation-wrap";
import { PastWrapViewer } from "@/components/past-wrap-viewer";
import { PlayerEndMetricsForm } from "@/components/player-end-metrics-form";
import { StreakBadges } from "@/components/streak-display";
import { Card, CardTitle } from "@/components/ui/card";
import { computeStreak } from "@/lib/gym-visits";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const { session, gym } = await requirePlayerGym();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: {
      completions: { include: { challenge: { select: { name: true } } } },
    },
  });

  const visitDates = await prisma.gymVisit.findMany({
    where: { userId: session.user.id },
    select: { visitDate: true },
  });
  const streak = computeStreak(visitDates.map((v) => v.visitDate));

  const allArchives = await prisma.competitionArchive.findMany({
    where: { gymId: gym.id },
    orderBy: { endedAt: "desc" },
  });
  const archives = allArchives.filter((a) => a.snapshotJson.includes(session.user.id));

  const habits = habitLabelsFromCompletions(user.completions);
  const showWrap = Boolean(user.endMetricsSentAt && !user.resultsWrapSeenAt);

  const awaitingResults =
    gym.challengeEnded &&
    gym.endPhase === "AWAITING_METRICS" &&
    !user.endMetricsSentAt;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Me</h1>
        <p className="text-sm text-slate-400">Your transformation journey</p>
      </div>

      {awaitingResults && <PlayerEndMetricsForm />}

      {showWrap && (
        <TransformationWrap
          competitionName={gym.competitionName}
          habits={habits}
          start={{
            skeletalMuscleMass: user.startSkeletalMuscleMass,
            weightLbs: user.startWeightLbs,
            bodyFatPercent: user.startBodyFatPercent,
            stepsPerDay: user.stepsPerDay,
            waterOzPerDay: user.waterOzPerDay,
          }}
          end={{
            skeletalMuscleMass: user.endSkeletalMuscleMass,
            weightLbs: user.endWeightLbs,
            bodyFatPercent: user.endBodyFatPercent,
          }}
        />
      )}

      <Card>
        <CardTitle>Squeeze&apos;s badge board</CardTitle>
        <p className="mt-1 text-xs text-slate-500">Check in at the gym to earn streak badges</p>
        <div className="mt-4">
          <StreakBadges streak={streak} />
        </div>
      </Card>

      <Card>
        <CardTitle>Beginning of transformation</CardTitle>
        <p className="mt-1 text-xs text-slate-500">Baseline you set at signup</p>
        <div className="mt-4">
          <BodyMetricsDisplay
            skeletalMuscleMass={user.startSkeletalMuscleMass}
            weightLbs={user.startWeightLbs}
            bodyFatPercent={user.startBodyFatPercent}
            variant="start"
          />
        </div>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Steps / day</dt>
            <dd className="font-medium text-emerald-400">
              {user.stepsPerDay?.toLocaleString() ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Water / day</dt>
            <dd className="font-medium text-emerald-400">
              {user.waterOzPerDay != null ? `${user.waterOzPerDay} oz` : "—"}
            </dd>
          </div>
        </dl>
      </Card>

      {user.endMetricsSentAt && user.resultsWrapSeenAt && (
        <Card>
          <CardTitle>Latest results</CardTitle>
          <BodyMetricsDisplay
            skeletalMuscleMass={user.endSkeletalMuscleMass}
            weightLbs={user.endWeightLbs}
            bodyFatPercent={user.endBodyFatPercent}
            variant="end"
          />
        </Card>
      )}

      {habits.length > 0 && (
        <Card>
          <CardTitle>Your frequent activities</CardTitle>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {habits.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
        </Card>
      )}

      {archives.length > 0 && (
        <div className="border-t border-white/10 pt-6">
          <h2 className="font-display text-lg font-semibold text-white">Past competitions</h2>
          <PastWrapViewer archives={archives.map((a) => ({
            id: a.id,
            name: a.name,
            endedAt: a.endedAt.toISOString(),
            snapshotJson: a.snapshotJson,
            userId: session.user.id,
          }))} />
        </div>
      )}
    </div>
  );
}
