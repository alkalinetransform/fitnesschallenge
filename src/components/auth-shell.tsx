import { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center animate-fade-in-up">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-400">
          Squeeze the day
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}
      </div>
      <div className="w-full max-w-md animate-scale-in stagger-2">{children}</div>
    </main>
  );
}
