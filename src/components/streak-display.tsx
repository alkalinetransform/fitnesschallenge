import { streakMessage, nextBadge, STREAK_BADGES } from "@/lib/gym-visits";
import { Mascot } from "@/components/mascot";
import { cn } from "@/lib/utils";

function mascotAnimationForStreak(streak: number) {
  if (streak >= 14) return "celebrate" as const;
  if (streak >= 7) return "wave" as const;
  if (streak >= 1) return "bounce" as const;
  return "wave" as const;
}

export function StreakDisplay({ streak }: { streak: number }) {
  const next = nextBadge(streak);
  const message = streakMessage(streak);

  return (
    <div className="overflow-hidden rounded-xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-brand-500/5 p-4">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Mascot size={88} animation={mascotAnimationForStreak(streak)} />
          <div className="absolute -bottom-1 -right-1 flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-orange-400/50 bg-slate-950 px-1.5 shadow-lg shadow-orange-500/20">
            <span className="font-display text-sm font-bold text-orange-300">{streak}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Gym streak
          </p>
          <p className="mt-1 text-sm leading-snug text-slate-200">
            <span className="font-medium text-brand-300">Squeeze says:</span> {message}
          </p>
          {next && (
            <p className="mt-2 text-xs text-slate-500">
              {next.days - streak} more day{next.days - streak === 1 ? "" : "s"} until{" "}
              {next.label} {next.emoji}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StreakBadges({ streak }: { streak: number }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Mascot size={64} animation={streak >= 5 ? "celebrate" : "float"} className="hidden sm:block" />
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {STREAK_BADGES.map((badge) => {
          const earned = streak >= badge.days;
          return (
            <div
              key={badge.days}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all",
                earned
                  ? "border-brand-500/40 bg-brand-500/15 text-brand-200 animate-scale-in"
                  : "border-white/5 bg-slate-800/40 text-slate-600"
              )}
              title={earned ? `Earned: ${badge.label}` : `Reach a ${badge.days}-day streak`}
            >
              <span className={earned ? "" : "grayscale opacity-40"}>{badge.emoji}</span>
              <span className="font-medium">{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
