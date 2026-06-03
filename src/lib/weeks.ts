const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeWeekFromSeason(seasonStartDate: Date): number {
  const elapsed = Date.now() - seasonStartDate.getTime();
  return Math.max(1, Math.floor(elapsed / WEEK_MS) + 1);
}

export function seasonStartForWeek(week: number): Date {
  return new Date(Date.now() - (week - 1) * WEEK_MS);
}
