import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { EndChallengeButton } from "@/components/end-challenge-button";
import { CompetitionStatusBanner } from "@/components/competition-status-banner";
import { getTeamScoresTotal, getPlayerScoresTotal } from "@/lib/scores";
import { hasActiveCompetition } from "@/lib/site-gym";
import { WeekControl } from "@/components/week-control";
import { NewCompetitionDialog } from "@/components/new-competition-dialog";
import { CompetitionInfoBox } from "@/components/competition-info-box";
import { AdminBroadcastModal } from "@/components/admin-broadcast-modal";
import { AdminEndMetricsPanel } from "@/components/admin-end-metrics-panel";
import type { EndMetricsPlayer } from "@/components/admin-end-metrics-panel";

export default async function AdminDashboardPage() {
  const { gym } = await requireApprovedAdminGym();
  const active = hasActiveCompetition(gym);

  const playerCount = await prisma.user.count({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
  });

  const messagePlayers = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const teams = gym.challengeEnded ? await getTeamScoresTotal(gym.id) : [];
  const allPlayers = gym.challengeEnded ? await getPlayerScoresTotal(gym.id) : [];

  const awaitingMetrics = gym.endPhase === "AWAITING_METRICS";

  let endMetricsPlayers: EndMetricsPlayer[] = [];
  let allMetricsComplete = false;

  if (awaitingMetrics) {
    const players = await prisma.user.findMany({
      where: { gymId: gym.id, role: "PLAYER" },
      orderBy: { name: "asc" },
    });
    const drafts = await prisma.playerEndMetricsDraft.findMany({
      where: { gymId: gym.id },
    });
    const draftMap = new Map(drafts.map((d) => [d.userId, d]));

    endMetricsPlayers = players.map((p) => ({
      id: p.id,
      name: p.name,
      sent: Boolean(p.endMetricsSentAt),
      draft: {
        skeletalMuscleMass: draftMap.get(p.id)?.skeletalMuscleMass ?? null,
        weightLbs: draftMap.get(p.id)?.weightLbs ?? null,
        bodyFatPercent: draftMap.get(p.id)?.bodyFatPercent ?? null,
      },
    }));

    allMetricsComplete = endMetricsPlayers.every(
      (p) =>
        p.draft.skeletalMuscleMass != null ||
        p.draft.weightLbs != null ||
        p.draft.bodyFatPercent != null
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <CompetitionInfoBox
        name={gym.name}
        competitionName={gym.competitionName}
        activeWeek={gym.activeWeek}
        active={active}
      />

      <div className="flex flex-wrap items-center gap-3">
        <AdminBroadcastModal players={messagePlayers} />
      </div>

      {gym.challengeEnded && (
        <CompetitionStatusBanner
          ended
          endedAt={gym.endedAt}
          winningTeam={teams[0] ?? null}
          topPlayer={allPlayers[0] ?? null}
        />
      )}

      {!active && <NewCompetitionDialog playerCount={playerCount} />}

      {active && (
        <>
          <WeekControl defaultWeek={gym.activeWeek} />

          <div className="space-y-2 border-t border-white/10 pt-6">
            <p className="text-sm text-slate-500">
              End the competition to lock all scores. You&apos;ll then enter final body metrics for
              players.
            </p>
            <EndChallengeButton />
          </div>
        </>
      )}

      {awaitingMetrics && (
        <AdminEndMetricsPanel players={endMetricsPlayers} allComplete={allMetricsComplete} />
      )}
    </div>
  );
}
