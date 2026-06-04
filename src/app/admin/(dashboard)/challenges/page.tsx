import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AddChallengeForm } from "@/components/add-challenge-form";
import { ChallengesBoard, type ChallengeRow } from "@/components/challenges-board";
import { hasActiveCompetition } from "@/lib/site-gym";
import { AdminTabEndedOverlay } from "@/components/admin-tab-ended-overlay";

export default async function AdminChallengesPage() {
  const { gym } = await requireApprovedAdminGym();
  const ended = gym.challengeEnded;
  const now = new Date();

  const challenges = await prisma.challenge.findMany({
    where: { gymId: gym.id },
    orderBy: { startDate: "desc" },
  });

  const rows: ChallengeRow[] = challenges.map((c, i) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    points: c.points,
    durationWeeks: c.durationWeeks,
    startDate: c.startDate.toISOString(),
    expiresAt: c.expiresAt.toISOString(),
    index: challenges.length - i,
  }));

  const current = rows.filter(
    (c) => new Date(c.expiresAt) > now || new Date(c.startDate) > now
  );
  const archived = rows.filter((c) => new Date(c.expiresAt) <= now);

  return (
    <div className="space-y-6 animate-fade-in">
      {ended && <AdminTabEndedOverlay />}
      <div className={ended ? "pointer-events-none space-y-6 opacity-40" : "space-y-6"}>
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Challenges</h1>
        <p className="text-sm text-slate-400">
          Point-earning tasks inside the current competition
        </p>
      </div>

      {hasActiveCompetition(gym) && <AddChallengeForm />}

      <ChallengesBoard
        current={current}
        archived={archived}
        competitionEnded={gym.challengeEnded}
      />
      </div>
    </div>
  );
}
