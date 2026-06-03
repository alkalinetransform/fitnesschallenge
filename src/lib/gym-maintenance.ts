import { prisma } from "@/lib/db";
import { computeWeekFromSeason } from "@/lib/weeks";

/** Sync auto week counter. Expired challenges are kept for archive (not deleted). */
export async function maintainGym(gymId: string) {
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym || gym.challengeEnded) return gym;

  const computedWeek = computeWeekFromSeason(gym.seasonStartDate);
  if (computedWeek !== gym.activeWeek) {
    return prisma.gym.update({
      where: { id: gymId },
      data: { activeWeek: computedWeek },
    });
  }
  return gym;
}

export function challengeExpiresAt(startDate: Date, durationWeeks: number): Date {
  return new Date(startDate.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
}
