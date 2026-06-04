import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPlayerScoresTotal } from "@/lib/scores";
import { isNewPlayer } from "@/lib/player-utils";
import { AdminPlayersGrid, type AdminPlayerRow } from "@/components/admin-players-grid";
import { AdminTabEndedOverlay } from "@/components/admin-tab-ended-overlay";

export default async function AdminPlayersPage() {
  const { gym } = await requireApprovedAdminGym();
  const ended = gym.challengeEnded;

  const players = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER" },
    include: {
      teamMembers: { include: { team: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  });

  const scores = await getPlayerScoresTotal(gym.id);
  const scoreMap = new Map(scores.map((s) => [s.userId, s.points]));

  const rows: AdminPlayerRow[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    isFrozen: p.isFrozen,
    isNew: isNewPlayer(p.createdAt),
    teamName: p.teamMembers[0]?.team.name ?? null,
    points: scoreMap.get(p.id) ?? 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {ended && <AdminTabEndedOverlay />}
      <div className={ended ? "pointer-events-none space-y-6 opacity-40" : "space-y-6"}>
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Players</h1>
        <p className="text-sm text-slate-400">2×4 grid · search · freeze or delete accounts</p>
      </div>
      <AdminPlayersGrid players={rows} />
      </div>
    </div>
  );
}
