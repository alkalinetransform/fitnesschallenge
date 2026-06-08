"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym } from "@/lib/session";
import { splitIntoTeams } from "@/lib/team-shuffle";
import { iconForTeamIndex } from "@/lib/team-icons";

const MAX_TEAMS = 50;

function assertChallengeActive(gym: { challengeEnded: boolean }) {
  if (gym.challengeEnded) {
    return { error: "Competition has ended. Scores are locked." } as const;
  }
  return null;
}

export async function createTeam() {
  const { gym } = await requireApprovedAdminGym();
  const locked = assertChallengeActive(gym);
  if (locked) return locked;

  const existingCount = await prisma.team.count({ where: { gymId: gym.id } });
  if (existingCount >= MAX_TEAMS) {
    return { error: `Maximum ${MAX_TEAMS} teams` };
  }

  await prisma.team.create({
    data: {
      gymId: gym.id,
      name: `Team ${existingCount + 1}`,
      icon: iconForTeamIndex(existingCount),
    },
  });

  revalidatePath("/admin/teams");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function previewTeams(teamCount: number) {
  const { gym } = await requireApprovedAdminGym();
  const locked = assertChallengeActive(gym);
  if (locked) return locked;

  if (!Number.isInteger(teamCount) || teamCount < 1 || teamCount > MAX_TEAMS) {
    return { error: `Enter a valid number of teams (1–${MAX_TEAMS})` };
  }

  const players = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (players.length < 1) {
    return { error: "Need at least 1 active player to preview teams" };
  }

  const groups = splitIntoTeams(players, teamCount);
  return {
    preview: groups.map((group, i) => ({
      name: `Team ${i + 1}`,
      icon: iconForTeamIndex(i),
      players: group.map((p) => ({ id: p.id, name: p.name })),
    })),
  };
}

export async function generateTeams(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const locked = assertChallengeActive(gym);
  if (locked) return locked;

  const teamCount = Number(formData.get("teamCount"));

  if (!Number.isInteger(teamCount) || teamCount < 1 || teamCount > MAX_TEAMS) {
    return { error: `Enter a valid number of teams (1–${MAX_TEAMS})` };
  }

  const players = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
    select: { id: true, name: true },
  });

  if (players.length < 1) {
    return { error: "Need at least 1 active player to generate teams" };
  }

  const groups = splitIntoTeams(players, teamCount);

  await prisma.$transaction(async (tx) => {
    await tx.team.deleteMany({ where: { gymId: gym.id } });

    for (let i = 0; i < groups.length; i++) {
      const team = await tx.team.create({
        data: { gymId: gym.id, name: `Team ${i + 1}`, icon: iconForTeamIndex(i) },
      });
      const group = groups[i];
      if (group.length > 0) {
        await tx.teamMember.createMany({
          data: group.map((p) => ({
            teamId: team.id,
            userId: p.id,
          })),
        });
      }
    }
  });

  revalidatePath("/admin/teams");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function movePlayerToTeam(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const locked = assertChallengeActive(gym);
  if (locked) return locked;

  const userId = formData.get("userId") as string;
  const teamId = formData.get("teamId") as string;

  const player = await prisma.user.findFirst({
    where: { id: userId, gymId: gym.id, role: "PLAYER" },
  });
  const team = await prisma.team.findFirst({
    where: { id: teamId, gymId: gym.id },
  });
  if (!player || !team) return { error: "Invalid player or team" };

  await prisma.$transaction(async (tx) => {
    await tx.teamMember.deleteMany({ where: { userId } });
    await tx.teamMember.create({
      data: { teamId, userId },
    });
  });

  revalidatePath("/admin/teams");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function removePlayerFromTeam(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const userId = formData.get("userId") as string;

  const player = await prisma.user.findFirst({
    where: { id: userId, gymId: gym.id, role: "PLAYER" },
  });
  if (!player) return { error: "Player not found" };

  await prisma.teamMember.deleteMany({ where: { userId } });

  revalidatePath("/admin/teams");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function renameTeam(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  const teamId = formData.get("teamId") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Team name required" };

  const team = await prisma.team.findFirst({
    where: { id: teamId, gymId: gym.id },
  });
  if (!team) return { error: "Team not found" };

  await prisma.team.update({ where: { id: teamId }, data: { name } });
  revalidatePath("/admin/teams");
  revalidatePath("/leaderboard");
  return { success: true };
}
