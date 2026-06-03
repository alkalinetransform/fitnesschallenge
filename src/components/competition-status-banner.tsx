import type { TeamScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

/** Shown when a competition (season) has ended and scores are locked. */
export function CompetitionStatusBanner({
  ended,
  endedAt,
  winningTeam,
  topPlayer,
}: {
  ended: boolean;
  endedAt: Date | null;
  winningTeam?: TeamScore | null;
  topPlayer?: { name: string; points: number } | null;
}) {
  if (!ended) return null;

  const dateStr = endedAt
    ? endedAt.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={cn(
        "animate-fade-in-up rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-brand-500/10 to-emerald-500/10 p-6"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
        Competition complete · scores locked
      </p>
      <h2 className="mt-1 font-display text-2xl font-bold text-white">
        Final results
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Challenges in this competition no longer award points.
      </p>
      {dateStr && (
        <p className="mt-1 text-sm text-slate-500">Ended {dateStr}</p>
      )}
      {(winningTeam || topPlayer) && (
        <div className="mt-4 flex flex-wrap gap-4">
          {winningTeam && (
            <div className="rounded-xl border border-amber-500/20 bg-slate-900/50 px-4 py-3">
              <p className="text-xs text-slate-500">Winning team</p>
              <p className="font-display text-lg font-bold text-amber-300">
                {winningTeam.name}
              </p>
              <p className="text-sm text-brand-400">{winningTeam.points} pts</p>
            </div>
          )}
          {topPlayer && topPlayer.points > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-slate-900/50 px-4 py-3">
              <p className="text-xs text-slate-500">Top player</p>
              <p className="font-display text-lg font-bold text-emerald-300">
                {topPlayer.name}
              </p>
              <p className="text-sm text-brand-400">{topPlayer.points} pts</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
