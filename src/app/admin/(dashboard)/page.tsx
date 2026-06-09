import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { EndChallengeButton } from "@/components/end-challenge-button";
import { CompetitionStatusBanner } from "@/components/competition-status-banner";
import { getTeamScoresTotal, getPlayerScoresTotal } from "@/lib/scores";
import { hasActiveCompetition } from "@/lib/site-gym";
import { WeekControl } from "@/components/week-control";
import { getMaxSelectableWeek } from "@/lib/weeks";
import { NewCompetitionDialog } from "@/components/new-competition-dialog";
import { CompetitionInfoBox } from "@/components/competition-info-box";
import { AdminBroadcastModal } from "@/components/admin-broadcast-modal";
import { AdminArchivePanel } from "@/components/admin-archive-panel";
import { AdminCheckInQr } from "@/components/admin-check-in-qr";

export default async function AdminDashboardPage() {
  const { gym } = await requireApprovedAdminGym();
  const active = hasActiveCompetition(gym);
  const maxWeek = getMaxSelectableWeek(gym.seasonStartDate);

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const checkInUrl = `${baseUrl}/check-in/${gym.checkInSecret}`;

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
  let submittedCount = 0;
  let totalPlayers = 0;

  if (awaitingMetrics) {
    const players = await prisma.user.findMany({
      where: { gymId: gym.id, role: "PLAYER" },
      select: { endMetricsSentAt: true },
    });
    totalPlayers = players.length;
    submittedCount = players.filter((p) => p.endMetricsSentAt).length;
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

      {active && <AdminCheckInQr checkInUrl={checkInUrl} />}

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
          <WeekControl
            defaultWeek={gym.activeWeek}
            calendarWeek={maxWeek}
            maxWeek={maxWeek}
          />

          <div className="space-y-2 border-t border-white/10 pt-6">
            <p className="text-sm text-slate-500">
              End the competition to lock all scores. Players will enter their own final metrics on
              the Me tab.
            </p>
            <EndChallengeButton />
          </div>
        </>
      )}

      {awaitingMetrics && (
        <AdminArchivePanel submittedCount={submittedCount} totalPlayers={totalPlayers} />
      )}
    </div>
  );
}
