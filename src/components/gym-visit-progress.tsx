import { WEEKLY_GYM_GOAL } from "@/lib/gym-visits";
import { cn } from "@/lib/utils";

export function GymVisitProgress({
  weekCount,
  weekGoal = WEEKLY_GYM_GOAL,
}: {
  weekCount: number;
  weekGoal?: number;
}) {
  const pct = Math.min(100, Math.round((weekCount / weekGoal) * 100));
  const complete = weekCount >= weekGoal;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
            Gym visits this week
          </p>
          <p className="mt-0.5 text-sm text-slate-400">Scan the QR code at the gym to check in</p>
        </div>
        <span className="font-display text-2xl font-bold text-white">
          {weekCount}
          <span className="text-base font-normal text-slate-500">/{weekGoal}</span>
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            complete ? "bg-gradient-to-r from-emerald-500 to-brand-500" : "bg-gradient-to-r from-brand-500 to-brand-600"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        {complete
          ? "Weekly goal complete — bonus points earned!"
          : `${weekGoal - weekCount} more visit${weekGoal - weekCount === 1 ? "" : "s"} for bonus points`}
      </p>
    </div>
  );
}
