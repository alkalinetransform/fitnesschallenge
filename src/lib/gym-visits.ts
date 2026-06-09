export const WEEKLY_GYM_GOAL = 3;
export const WEEKLY_GYM_POINTS = 15;
export const GYM_VISIT_CHALLENGE_NAME = "Gym visits (3×/week)";

export const STREAK_BADGES = [
  { days: 5, label: "5-day streak", emoji: "🔥" },
  { days: 10, label: "10-day streak", emoji: "💪" },
  { days: 20, label: "20-day streak", emoji: "⚡" },
  { days: 30, label: "30-day streak", emoji: "🏆" },
] as const;

export const STREAK_MESSAGES = [
  { min: 30, text: "Legend status! You're unstoppable." },
  { min: 14, text: "Two weeks strong — your future self thanks you." },
  { min: 7, text: "A full week! Consistency is your superpower." },
  { min: 3, text: "You're building momentum — keep showing up!" },
  { min: 1, text: "Great start! Come back tomorrow to grow your streak." },
  { min: 0, text: "Scan the gym QR code to start your streak today!" },
] as const;

export function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeStreak(visitDates: Date[]): number {
  if (visitDates.length === 0) return 0;

  const days = new Set(visitDates.map((d) => utcDayKey(d)));
  const today = utcDayKey(new Date());
  const yesterday = utcDayKey(new Date(Date.now() - 86400000));

  let cursor: string;
  if (days.has(today)) {
    cursor = today;
  } else if (days.has(yesterday)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  let t = startOfUtcDay(new Date(cursor + "T00:00:00.000Z"));
  while (days.has(utcDayKey(t))) {
    streak++;
    t = new Date(t.getTime() - 86400000);
  }
  return streak;
}

export function streakMessage(streak: number): string {
  for (const m of STREAK_MESSAGES) {
    if (streak >= m.min) return m.text;
  }
  return STREAK_MESSAGES[STREAK_MESSAGES.length - 1]!.text;
}

export function earnedBadges(streak: number) {
  return STREAK_BADGES.filter((b) => streak >= b.days);
}

export function nextBadge(streak: number) {
  return STREAK_BADGES.find((b) => streak < b.days) ?? null;
}
