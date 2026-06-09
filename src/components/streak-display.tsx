import { streakMessage, nextBadge, STREAK_BADGES } from "@/lib/gym-visits";

export function StreakDisplay({ streak }: { streak: number }) {
  const next = nextBadge(streak);

  return (
    <div className="rounded-xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-brand-500/5 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-orange-500/20 ring-2 ring-orange-500/30">
          <span className="text-2xl">🔥</span>
          <span className="font-display text-lg font-bold leading-none text-orange-300">{streak}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Gym streak
          </p>
          <p className="mt-0.5 text-sm text-slate-300">{streakMessage(streak)}</p>
          {next && (
            <p className="mt-1 text-xs text-slate-500">
              {next.days - streak} day{next.days - streak === 1 ? "" : "s"} until {next.emoji}{" "}
              {next.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StreakBadges({ streak }: { streak: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STREAK_BADGES.map((badge) => {
        const earned = streak >= badge.days;
        return (
          <div
            key={badge.days}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              earned
                ? "border-brand-500/40 bg-brand-500/15 text-brand-200"
                : "border-white/5 bg-slate-800/40 text-slate-600"
            }`}
            title={earned ? `Earned: ${badge.label}` : `Reach a ${badge.days}-day streak`}
          >
            <span className={earned ? "" : "grayscale opacity-40"}>{badge.emoji}</span>
            <span className="font-medium">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}
