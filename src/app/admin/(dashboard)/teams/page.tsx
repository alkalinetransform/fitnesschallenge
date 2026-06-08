import { requireApprovedAdminGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { TeamEditor } from "@/components/team-editor";
import { TeamGenerator } from "@/components/team-generator";
import { AddTeamButton } from "@/components/add-team-button";
import { UnassignedPlayersPanel } from "@/components/unassigned-players-panel";
import { AdminTabEndedOverlay } from "@/components/admin-tab-ended-overlay";

export default async function AdminTeamsPage() {
  const { gym } = await requireApprovedAdminGym();
  const ended = gym.challengeEnded;

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
    select: { id: true, name: true, createdAt: true, teamMembers: { select: { teamId: true } } },
  });

  const assignedIds = new Set(teams.flatMap((t) => t.members.map((m) => m.userId)));
  const unassigned = allPlayers.filter((p) => !assignedIds.has(p.id));

  const unassignedForPanel = unassigned.map((p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
  }));

  const unassignedEditor = unassigned.map((p) => ({
    id: p.id,
    name: p.name,
    teamId: null as string | null,
  }));

  const teamData = teams.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    members: t.members.map((m) => ({ userId: m.userId, name: m.user.name })),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {ended && <AdminTabEndedOverlay />}
      <div className={ended ? "pointer-events-none space-y-6 opacity-40" : "space-y-6"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Teams</h1>
          <p className="text-sm text-slate-400">
            {teams.length} team{teams.length === 1 ? "" : "s"} · shuffle rosters or add teams anytime
          </p>
        </div>
        <AddTeamButton />
      </div>

      <TeamGenerator playerCount={allPlayers.length} />

      <UnassignedPlayersPanel players={unassignedForPanel} />

      {teams.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-white">Edit teams</h2>
          <TeamEditor teams={teamData} unassigned={unassignedEditor} />
        </div>
      )}
      </div>
    </div>
  );
}
