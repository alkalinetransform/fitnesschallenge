"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePlayerGym } from "@/lib/session";
import {
  GYM_VISIT_CHALLENGE_NAME,
  WEEKLY_GYM_GOAL,
  WEEKLY_GYM_POINTS,
  startOfUtcDay,
} from "@/lib/gym-visits";
import { challengeExpiresAt } from "@/lib/gym-maintenance";

async function ensureWeeklyGymChallenge(gymId: string, weekNumber: number) {
  const existing = await prisma.challenge.findFirst({
    where: { gymId, weekNumber, name: GYM_VISIT_CHALLENGE_NAME },
  });
  if (existing) return existing;

  const start = new Date();
  return prisma.challenge.create({
    data: {
      gymId,
      weekNumber,
      name: GYM_VISIT_CHALLENGE_NAME,
      description: "Scan the gym QR code 3 times this week to earn bonus points.",
      points: WEEKLY_GYM_POINTS,
      durationDays: 7,
      startDate: start,
      expiresAt: challengeExpiresAt(start, 7),
    },
  });
}

export async function recordGymCheckIn(token: string) {
  const { session, gym } = await requirePlayerGym();

  if (gym.challengeEnded) {
    return { error: "Competition has ended — check-ins are closed." };
  }

  const targetGym = await prisma.gym.findFirst({
    where: { checkInSecret: token, status: "APPROVED" },
  });

  if (!targetGym || targetGym.id !== gym.id) {
    return { error: "Invalid gym QR code." };
  }

  const visitDate = startOfUtcDay();
  const existing = await prisma.gymVisit.findUnique({
    where: { userId_visitDate: { userId: session.user.id, visitDate } },
  });

  if (existing) {
    const weekCount = await prisma.gymVisit.count({
      where: { userId: session.user.id, gymId: gym.id, weekNumber: gym.activeWeek },
    });
    return {
      alreadyToday: true,
      weekCount,
      weekGoal: WEEKLY_GYM_GOAL,
      message: "You already checked in today. See you tomorrow!",
    };
  }

  await prisma.gymVisit.create({
    data: {
      userId: session.user.id,
      gymId: gym.id,
      weekNumber: gym.activeWeek,
      visitDate,
    },
  });

  const weekCount = await prisma.gymVisit.count({
    where: { userId: session.user.id, gymId: gym.id, weekNumber: gym.activeWeek },
  });

  let pointsAwarded = false;
  if (weekCount >= WEEKLY_GYM_GOAL) {
    const challenge = await ensureWeeklyGymChallenge(gym.id, gym.activeWeek);
    const completion = await prisma.completion.findUnique({
      where: {
        userId_challengeId: { userId: session.user.id, challengeId: challenge.id },
      },
    });
    if (!completion) {
      await prisma.completion.create({
        data: { userId: session.user.id, challengeId: challenge.id },
      });
      pointsAwarded = true;
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/me");
  revalidatePath("/leaderboard");

  return {
    success: true,
    weekCount,
    weekGoal: WEEKLY_GYM_GOAL,
    pointsAwarded,
    message:
      weekCount >= WEEKLY_GYM_GOAL
        ? pointsAwarded
          ? `Goal reached! +${WEEKLY_GYM_POINTS} points awarded.`
          : "Weekly gym goal complete!"
        : `${weekCount}/${WEEKLY_GYM_GOAL} visits this week — keep it up!`,
  };
}
