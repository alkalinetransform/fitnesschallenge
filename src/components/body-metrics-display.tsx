import { Mascot } from "@/components/mascot";
import { cn } from "@/lib/utils";

function MetricPill({
  label,
  value,
  unit,
  className,
}: {
  label: string;
  value: string;
  unit: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-center", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-display text-lg font-bold text-brand-400">
        {value}
        <span className="text-xs font-normal text-slate-400"> {unit}</span>
      </p>
    </div>
  );
}

export function BodyMetricsDisplay({
  skeletalMuscleMass,
  weightLbs,
  bodyFatPercent,
  variant = "start",
}: {
  skeletalMuscleMass: number | null;
  weightLbs: number | null;
  bodyFatPercent: number | null;
  variant?: "start" | "end";
}) {
  const accentRing =
    variant === "end" ? "ring-emerald-500/30 shadow-emerald-500/10" : "ring-brand-500/30 shadow-brand-500/10";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative mx-auto flex min-h-[220px] items-center justify-center py-4">
        <div
          className={cn(
            "relative rounded-3xl bg-gradient-to-b from-brand-500/10 to-transparent p-4 ring-2",
            accentRing
          )}
        >
          <Mascot
            size={160}
            animation={variant === "end" ? "celebrate" : "float"}
            className="mx-auto"
          />
        </div>

        <div className="absolute left-0 top-[18%] w-[88px]">
          <MetricPill
            label="Muscle"
            value={skeletalMuscleMass != null ? String(skeletalMuscleMass) : "—"}
            unit="lbs"
          />
        </div>
        <div className="absolute right-0 top-[18%] w-[88px]">
          <MetricPill
            label="Body fat"
            value={bodyFatPercent != null ? String(bodyFatPercent) : "—"}
            unit="%"
          />
        </div>
        <div className="absolute bottom-0 left-1/2 w-[100px] -translate-x-1/2">
          <MetricPill
            label="Weight"
            value={weightLbs != null ? String(weightLbs) : "—"}
            unit="lbs"
            className={variant === "end" ? "border-emerald-500/30" : undefined}
          />
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        {variant === "end"
          ? "Look at you go — Squeeze is impressed!"
          : "Your starting line — let’s squeeze the day!"}
      </p>
    </div>
  );
}
