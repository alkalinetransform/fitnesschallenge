import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  badge,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}) {
  return (
    <div className={cn("animate-fade-in-up", className)}>
      {badge && (
        <span className="mb-2 inline-block rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400">
          {badge}
        </span>
      )}
      <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-xl text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
