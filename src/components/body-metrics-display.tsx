import { cn } from "@/lib/utils";

function MetricRing({
  label,
  value,
  unit,
  position,
}: {
  label: string;
  value: string;
  unit: string;
  position: "left" | "right" | "bottom";
}) {
  const posClass =
    position === "left"
      ? "left-0 top-1/3 -translate-x-2"
      : position === "right"
        ? "right-0 top-1/3 translate-x-2"
        : "bottom-0 left-1/2 -translate-x-1/2 translate-y-2";

  return (
    <div className={cn("absolute max-w-[120px] text-center", posClass)}>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
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
  const accent = variant === "end" ? "text-emerald-400" : "text-brand-400";

  return (
    <div className="relative mx-auto h-56 w-full max-w-xs">
      <svg viewBox="0 0 120 200" className="mx-auto h-full w-24 opacity-40" aria-hidden>
        <ellipse cx="60" cy="28" rx="22" ry="26" fill="currentColor" className="text-slate-500" />
        <path
          d="M35 54 Q60 48 85 54 L78 120 Q60 125 42 120 Z"
          fill="currentColor"
          className="text-slate-600"
        />
        <path d="M42 120 L32 190 M78 120 L88 190" stroke="currentColor" strokeWidth="8" className="text-slate-600" />
      </svg>
      <MetricRing
        label="Skeletal muscle"
        value={skeletalMuscleMass != null ? String(skeletalMuscleMass) : "—"}
        unit="lbs"
        position="left"
      />
      <MetricRing
        label="Body fat"
        value={bodyFatPercent != null ? String(bodyFatPercent) : "—"}
        unit="%"
        position="right"
      />
      <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 text-center", accent)}>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">Weight</p>
        <p className="font-display text-xl font-bold">
          {weightLbs != null ? weightLbs : "—"}
          <span className="text-xs font-normal text-slate-400"> lbs</span>
        </p>
      </div>
    </div>
  );
}
