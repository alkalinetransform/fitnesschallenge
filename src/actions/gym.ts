"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireApprovedAdminGym } from "@/lib/session";
import { seasonStartForWeek } from "@/lib/weeks";

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
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}

export async function startNewCompetition() {
  const { gym } = await requireApprovedAdminGym();
  if (!gym.challengeEnded) {
    return { error: "A competition is already in progress" };
  }

  const start = new Date();
  await prisma.gym.update({
    where: { id: gym.id },
    data: {
      challengeEnded: false,
      endedAt: null,
      activeWeek: 1,
      seasonStartDate: start,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/challenges");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}
