"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym } from "@/lib/session";
import { seasonStartForWeek } from "@/lib/weeks";
import { splitIntoTeams } from "@/lib/team-shuffle";

export async function setActiveWeek(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  if (gym.challengeEnded) {
    return { error: "Competition has ended. Scores are locked." };
  }

  const week = Number(formData.get("activeWeek"));
  if (!Number.isInteger(week) || week < 1 || week > 52) {
    return { error: "Week must be between 1 and 52" };
  }

  await prisma.gym.update({
    where: { id: gym.id },
    data: {
      activeWeek: week,
      seasonStartDate: seasonStartForWeek(week),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function setActiveWeekForm(formData: FormData): Promise<void> {
  await setActiveWeek(formData);
}

export async function endChallenge() {
  const { gym } = await requireApprovedAdminGym();
  if (gym.challengeEnded) {
    return { error: "Competition is already finished" };
  }

  await prisma.gym.update({
    where: { id: gym.id },
    data: {
      challengeEnded: true,
      endedAt: new Date(),
      endPhase: "AWAITING_METRICS",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function startNewCompetitionWithTeams(formData: FormData) {
  const { gym } = await requireApprovedAdminGym();
  if (!gym.challengeEnded) {
    return { error: "A competition is already in progress" };
  }

  const parsed = z
    .object({
      competitionName: z.string().min(2).max(120),
      teamCount: z.coerce.number().int().min(1).max(50),
    })
    .safeParse({
      competitionName: formData.get("competitionName"),
      teamCount: formData.get("teamCount"),
    });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const players = await prisma.user.findMany({
    where: { gymId: gym.id, role: "PLAYER", isFrozen: false },
    select: { id: true, name: true },
  });

  if (players.length >= 2 && parsed.data.teamCount > players.length) {
    return { error: "Cannot have more teams than players" };
  }

  const start = new Date();
  const groups =
    players.length >= 2 ? splitIntoTeams(players, parsed.data.teamCount) : [];

  await prisma.$transaction(async (tx) => {
    await tx.gym.update({
      where: { id: gym.id },
      data: {
        challengeEnded: false,
        endedAt: null,
        endPhase: "NONE",
        activeWeek: 1,
        seasonStartDate: start,
        competitionName: parsed.data.competitionName,
      },
    });

    await tx.team.deleteMany({ where: { gymId: gym.id } });

    for (let i = 0; i < groups.length; i++) {
      const team = await tx.team.create({
        data: { gymId: gym.id, name: `Team ${i + 1}` },
      });
      const group = groups[i];
      if (group?.length) {
        await tx.teamMember.createMany({
          data: group.map((p) => ({ teamId: team.id, userId: p.id })),
        });
      }
    }

    await tx.user.updateMany({
      where: { gymId: gym.id, role: "PLAYER" },
      data: {
        endSkeletalMuscleMass: null,
        endWeightLbs: null,
        endBodyFatPercent: null,
        endBoneMass: null,
        endMuscleMass: null,
        endMetricsSentAt: null,
        resultsWrapSeenAt: null,
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/challenges");
  revalidatePath("/admin/teams");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}
