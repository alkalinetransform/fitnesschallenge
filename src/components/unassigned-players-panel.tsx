import { isNewPlayer } from "@/lib/player-utils";
import { cn } from "@/lib/utils";

export function UnassignedPlayersPanel({
  players,
}: {
  players: { id: string; name: string; createdAt: Date }[];
}) {
  const newCount = players.filter((p) => isNewPlayer(p.createdAt)).length;

  return (
    <div className="glass-card relative border-amber-500/25 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Unassigned players</h2>
          <p className="text-sm text-slate-400">
            {players.length} unassigned
            {newCount > 0 && ` · ${newCount} new today`}
          </p>
        </div>
        {newCount > 0 && (
          <span className="rounded border border-red-500/50 bg-red-500/20 px-2 py-1 text-xs font-bold uppercase text-red-300">
            {newCount} new
          </span>
        )}
      </div>
      {players.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Everyone is on a team.</p>
      ) : (
        <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto scrollbar-brand">
          {players.map((p) => (
            <li
              key={p.id}
              className={cn(
                "flex items-center justify-between rounded-lg border border-white/5 bg-slate-800/40 px-3 py-2 text-sm",
                isNewPlayer(p.createdAt) && "border-red-500/30"
              )}
            >
              <span className="text-slate-200">{p.name}</span>
              {isNewPlayer(p.createdAt) && (
                <span className="text-[10px] font-bold uppercase text-red-400">New</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
