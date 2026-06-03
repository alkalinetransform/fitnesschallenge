import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { TeamGenerator } from "@/components/team-generator";
import { TeamEditor } from "@/components/team-editor";

export default async function AdminTeamsPage() {
  const { gym } = await requireApprovedAdminGym();

  const playerCount = await prisma.user.count({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
  });

  const teams = await prisma.team.findMany({
    where: { gymId: gym.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const allPlayers = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
    select: { id: true, name: true, teamMembers: { select: { teamId: true } } },
  });

  const assignedIds = new Set(teams.flatMap((t) => t.members.map((m) => m.userId)));
  const unassigned = allPlayers
    .filter((p) => !assignedIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, teamId: null }));

  const teamData = teams.map((t) => ({
    id: t.id,
    name: t.name,
    members: t.members.map((m) => ({ userId: m.userId, name: m.user.name })),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Teams</h1>
        <p className="text-sm text-slate-400">Orange roster panels · scroll to browse players</p>
      </div>

      {!gym.challengeEnded && <TeamGenerator playerCount={playerCount} />}

      {teams.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-white">
            Edit teams manually
          </h2>
          <TeamEditor teams={teamData} unassigned={unassigned} />
        </div>
      )}
    </div>
  );
}
