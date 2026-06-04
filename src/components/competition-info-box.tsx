export function CompetitionInfoBox({
  name,
  competitionName,
  activeWeek,
  active,
}: {
  name: string;
  competitionName: string;
  activeWeek: number;
  active: boolean;
}) {
  return (
    <div className="glass-card border-brand-500/25 bg-gradient-to-br from-brand-500/10 to-transparent p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Current challenge</p>
      <p className="mt-1 font-display text-xl font-bold text-white">{competitionName}</p>
      <p className="text-sm text-slate-400">{name}</p>
      <p className="mt-2 text-xs text-slate-500">
        {active ? `Week ${activeWeek} · Competition in progress` : "No active competition"}
      </p>
    </div>
  );
}
