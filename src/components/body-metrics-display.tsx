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
  const muscleFill = variant === "end" ? "#34d399" : "#fb923c";
  const fatOpacity = bodyFatPercent != null ? Math.min(0.55, bodyFatPercent / 100 + 0.1) : 0.15;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative mx-auto aspect-[3/5] w-48 max-w-full">
        <svg
          viewBox="0 0 200 340"
          className="h-full w-full drop-shadow-lg"
          aria-label="Body silhouette with metrics"
        >
          <defs>
            <linearGradient id={`bodyGrad-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={muscleFill} stopOpacity="0.9" />
              <stop offset="100%" stopColor={muscleFill} stopOpacity="0.45" />
            </linearGradient>
            <filter id="bodyGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Head */}
          <ellipse cx="100" cy="42" rx="28" ry="32" fill={`url(#bodyGrad-${variant})`} filter="url(#bodyGlow)" />
          <ellipse cx="100" cy="38" rx="22" ry="24" fill="#1e293b" opacity="0.25" />

          {/* Neck */}
          <rect x="88" y="68" width="24" height="14" rx="6" fill={`url(#bodyGrad-${variant})`} opacity="0.8" />

          {/* Torso */}
          <path
            d="M62 82 Q72 78 100 80 Q128 78 138 82 L148 118 Q152 150 148 188 Q140 210 100 214 Q60 210 52 188 Q48 150 52 118 Z"
            fill={`url(#bodyGrad-${variant})`}
            filter="url(#bodyGlow)"
          />
          {/* Body fat overlay */}
          <path
            d="M62 82 Q72 78 100 80 Q128 78 138 82 L148 118 Q152 150 148 188 Q140 210 100 214 Q60 210 52 188 Q48 150 52 118 Z"
            fill="#94a3b8"
            opacity={fatOpacity}
          />

          {/* Shoulders / arms */}
          <path
            d="M52 88 Q28 100 22 130 L26 168 Q30 178 38 174 L48 120 Q54 100 58 92 Z"
            fill={`url(#bodyGrad-${variant})`}
            opacity="0.85"
          />
          <path
            d="M148 88 Q172 100 178 130 L174 168 Q170 178 162 174 L152 120 Q146 100 142 92 Z"
            fill={`url(#bodyGrad-${variant})`}
            opacity="0.85"
          />

          {/* Legs */}
          <path
            d="M72 210 L64 300 Q62 318 70 322 L88 322 Q96 318 94 300 L98 210 Z"
            fill={`url(#bodyGrad-${variant})`}
            opacity="0.9"
          />
          <path
            d="M128 210 L136 300 Q138 318 130 322 L112 322 Q104 318 106 300 L102 210 Z"
            fill={`url(#bodyGrad-${variant})`}
            opacity="0.9"
          />

          {/* Muscle highlight lines */}
          <path d="M100 95 L100 200" stroke="white" strokeWidth="1" opacity="0.12" />
          <path d="M78 120 Q100 128 122 120" stroke="white" strokeWidth="1.5" opacity="0.15" fill="none" />
        </svg>

        <div className="absolute -left-2 top-[22%] w-[88px]">
          <MetricPill
            label="Muscle"
            value={skeletalMuscleMass != null ? String(skeletalMuscleMass) : "—"}
            unit="lbs"
          />
        </div>
        <div className="absolute -right-2 top-[22%] w-[88px]">
          <MetricPill
            label="Body fat"
            value={bodyFatPercent != null ? String(bodyFatPercent) : "—"}
            unit="%"
          />
        </div>
        <div className="absolute -bottom-1 left-1/2 w-[100px] -translate-x-1/2">
          <MetricPill
            label="Weight"
            value={weightLbs != null ? String(weightLbs) : "—"}
            unit="lbs"
            className={variant === "end" ? "border-emerald-500/30" : undefined}
          />
        </div>
      </div>
    </div>
  );
}
