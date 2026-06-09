import { prisma } from "@/lib/db";
import {
  GYM_VISIT_CHALLENGE_NAME,
  WEEKLY_GYM_GOAL,
  WEEKLY_GYM_POINTS,
  startOfUtcDay,
} from "@/lib/gym-visits";
import { challengeExpiresAt } from "@/lib/gym-maintenance";

export type CheckInResult = {
  error?: string;
  success?: boolean;
  alreadyToday?: boolean;
  weekCount?: number;
  weekGoal?: number;
  pointsAwarded?: boolean;
  message?: string;
};

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

export async function processGymCheckIn(
  userId: string,
  gymId: string,
  token: string
): Promise<CheckInResult> {
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) return { error: "Gym not found." };

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
    where: { userId_visitDate: { userId, visitDate } },
  });

  if (existing) {
    const weekCount = await prisma.gymVisit.count({
      where: { userId, gymId: gym.id, weekNumber: gym.activeWeek },
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
      userId,
      gymId: gym.id,
      weekNumber: gym.activeWeek,
      visitDate,
    },
  });

  const weekCount = await prisma.gymVisit.count({
    where: { userId, gymId: gym.id, weekNumber: gym.activeWeek },
  });

  let pointsAwarded = false;
  if (weekCount >= WEEKLY_GYM_GOAL) {
    const challenge = await ensureWeeklyGymChallenge(gym.id, gym.activeWeek);
    const completion = await prisma.completion.findUnique({
      where: {
        userId_challengeId: { userId, challengeId: challenge.id },
      },
    });
    if (!completion) {
      await prisma.completion.create({
        data: { userId, challengeId: challenge.id },
      });
      pointsAwarded = true;
    }
  }

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

export function checkInResultToSearchParams(result: CheckInResult): URLSearchParams {
  const params = new URLSearchParams();
  if (result.error) {
    params.set("error", result.error);
    return params;
  }
  if (result.alreadyToday) params.set("already", "1");
  if (result.success) params.set("success", "1");
  if (result.weekCount != null) params.set("weekCount", String(result.weekCount));
  if (result.weekGoal != null) params.set("weekGoal", String(result.weekGoal));
  if (result.pointsAwarded) params.set("points", "1");
  if (result.message) params.set("message", result.message);
  return params;
}

export function searchParamsToCheckInResult(
  params: URLSearchParams | Record<string, string | undefined>
): CheckInResult {
  const get = (key: string) =>
    params instanceof URLSearchParams ? params.get(key) : params[key];

  const error = get("error");
  if (error) return { error };

  return {
    success: get("success") === "1",
    alreadyToday: get("already") === "1",
    weekCount: get("weekCount") ? Number(get("weekCount")) : undefined,
    weekGoal: get("weekGoal") ? Number(get("weekGoal")) : undefined,
    pointsAwarded: get("points") === "1",
    message: get("message") ?? undefined,
  };
}
