const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Calendar week number from the real competition start (1-based). */
export function computeWeekFromSeason(seasonStartDate: Date): number {
  const elapsed = Date.now() - seasonStartDate.getTime();
  return Math.max(1, Math.floor(elapsed / WEEK_MS) + 1);
}

/** Latest week that exists in the competition timeline (no future weeks). */
export function getMaxSelectableWeek(seasonStartDate: Date): number {
  return computeWeekFromSeason(seasonStartDate);
}
