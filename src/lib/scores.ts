import { prisma } from "@/lib/db";
import { formatTeamLabel } from "@/lib/team-icons";

export type PlayerScore = {
  userId: string;
  name: string;
  points: number;
  completionCount: number;
};

export type TeamScore = {
  teamId: string;
  name: string;
  icon: string;
  points: number;
  players: PlayerScore[];
};

export async function getGymActiveWeek(gymId: string): Promise<number> {
  const gym = await prisma.gym.findUniqueOrThrow({
    where: { id: gymId },
    select: { activeWeek: true },
  });
  return gym.activeWeek;
}

/** All-time player points across every week in the challenge. */
export async function getPlayerScoresTotal(
  gymId: string,
  userIds?: string[]
): Promise<PlayerScore[]> {
  const players = await prisma.user.findMany({
    where: {
      gymId,
      role: "PLAYER",
      ...(userIds ? { id: { in: userIds } } : {}),
    },
    select: {
      id: true,
      name: true,
      completions: {
        where: { challenge: { gymId } },
        select: {
          challenge: { select: { points: true } },
        },
      },
    },
  });

  return sortPlayerScores(
    players.map((p) => {
      const points = p.completions.reduce(
        (sum, c) => sum + c.challenge.points,
        0
      );
      return {
        userId: p.id,
        name: p.name,
        points,
        completionCount: p.completions.length,
      };
    })
  );
}

export async function getTeamScoresTotal(gymId: string): Promise<TeamScore[]> {
  const teams = await prisma.team.findMany({
    where: { gymId },
    include: {
      members: { select: { userId: true } },
    },
    orderBy: { name: "asc" },
  });

  const result: TeamScore[] = [];
  for (const team of teams) {
    const memberIds = team.members.map((m) => m.userId);
    const players = await getPlayerScoresTotal(gymId, memberIds);
    const points = players.reduce((sum, p) => sum + p.points, 0);
    result.push({
      teamId: team.id,
      name: formatTeamLabel(team.name, team.icon),
      icon: team.icon,
      points,
      players,
    });
  }

  return result.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.name.localeCompare(b.name);
  });
}

/** Points for a single week (dashboard week progress). */
export async function getPlayerScoresForWeek(
  gymId: string,
  weekNumber: number,
  userIds?: string[]
): Promise<PlayerScore[]> {
  const players = await prisma.user.findMany({
    where: {
      gymId,
      role: "PLAYER",
      ...(userIds ? { id: { in: userIds } } : {}),
    },
    select: {
      id: true,
      name: true,
      completions: {
        where: {
          challenge: { gymId, weekNumber },
        },
        select: {
          challenge: { select: { points: true } },
        },
      },
    },
  });

  return sortPlayerScores(
    players.map((p) => {
      const points = p.completions.reduce(
        (sum, c) => sum + c.challenge.points,
        0
      );
      return {
        userId: p.id,
        name: p.name,
        points,
        completionCount: p.completions.length,
      };
    })
  );
}

function sortPlayerScores(players: PlayerScore[]): PlayerScore[] {
  return players.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.completionCount !== b.completionCount)
      return a.completionCount - b.completionCount;
    return a.name.localeCompare(b.name);
  });
}
