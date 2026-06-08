import { prisma } from "@/lib/db";
import { computeWeekFromSeason } from "@/lib/weeks";

/** Sync auto week counter. Expired challenges are kept for archive (not deleted). */
export async function maintainGym(gymId: string) {
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym || gym.challengeEnded) return gym;

  const calendarWeek = computeWeekFromSeason(gym.seasonStartDate);
  if (calendarWeek > gym.activeWeek) {
    return prisma.gym.update({
      where: { id: gymId },
      data: { activeWeek: calendarWeek },
    });
  }
  return gym;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function challengeExpiresAt(startDate: Date, durationDays: number): Date {
  return new Date(startDate.getTime() + durationDays * DAY_MS);
}
