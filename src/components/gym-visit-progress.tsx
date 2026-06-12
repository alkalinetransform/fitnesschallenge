import { WEEKLY_GYM_GOAL } from "@/lib/gym-visits";
import { Mascot } from "@/components/mascot";
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
  const remaining = weekGoal - weekCount;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="flex items-start gap-3">
        <Mascot size={72} animation={complete ? "celebrate" : "bounce"} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
                Gym visits this week
              </p>
              <p className="mt-0.5 text-sm text-slate-400">
                At the gym, open your phone&apos;s <strong className="text-slate-300">Camera app</strong> and scan the QR code to check in
              </p>
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
                complete
                  ? "bg-gradient-to-r from-emerald-500 to-brand-500"
                  : "bg-gradient-to-r from-brand-500 to-brand-600"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {complete
              ? "Squeeze says: weekly goal crushed — bonus points earned!"
              : remaining === 1
                ? "One more visit and Squeeze will throw a mini party!"
                : `${remaining} more visits — keep squeezing the day!`}
          </p>
        </div>
      </div>
    </div>
  );
}
