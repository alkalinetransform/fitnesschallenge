import { cn } from "@/lib/utils";

const accents = {
  orange: "from-brand-500/20 to-brand-600/5 border-brand-500/20 text-brand-400",
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
  violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
  sky: "from-sky-500/20 to-sky-600/5 border-sky-500/20 text-sky-400",
} as const;

export function StatCard({
  label,
  value,
  accent = "orange",
  className,
  delay,
}: {
  label: string;
  value: string | number;
  accent?: keyof typeof accents;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        "animate-fade-in-up glass-card relative overflow-hidden border bg-gradient-to-br p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        accents[accent],
        delay,
        className
      )}
    >
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
