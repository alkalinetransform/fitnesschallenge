"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePlayerGym } from "@/lib/session";

export async function toggleCompletion(challengeId: string, completed: boolean) {
  const { session, gym } = await requirePlayerGym();

  if (gym.challengeEnded) {
    return { error: "This competition has ended. Scores are locked." };
  }

  const now = new Date();
  const challenge = await prisma.challenge.findFirst({
    where: {
      id: challengeId,
      gymId: gym.id,
      startDate: { lte: now },
      expiresAt: { gt: now },
    },
  });
  if (!challenge) return { error: "Challenge not found or no longer active" };

  if (completed) {
    await prisma.completion.upsert({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId,
        },
      },
      create: { userId: session.user.id, challengeId },
      update: {},
    });
  } else {
    await prisma.completion.deleteMany({
      where: { userId: session.user.id, challengeId },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}
