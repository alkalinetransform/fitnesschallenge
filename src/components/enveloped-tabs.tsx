"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type EnvelopedTab = {
  href: string;
  label: string;
  shortLabel?: string;
  match: (pathname: string) => boolean;
  disabled?: boolean;
  badge?: string;
  glow?: boolean;
};

export function EnvelopedTabs({
  tabs,
  ariaLabel,
  leading,
}: {
  tabs: EnvelopedTab[];
  ariaLabel: string;
  leading?: React.ReactNode;
}) {
  const pathname = usePathname();
  const columnCount = tabs.length + (leading ? 1 : 0);

  return (
    <nav
      className="border-b border-white/10 bg-slate-950/70 backdrop-blur-md"
      aria-label={ariaLabel}
    >
      <div className="w-full px-2 py-3 sm:px-4">
        <div
          className="grid w-full gap-1.5 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 shadow-inner shadow-black/20"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {leading && (
            <div className="flex min-h-[44px] min-w-0 items-center justify-center rounded-xl px-2 py-3 sm:min-h-[48px] sm:px-3">
              {leading}
            </div>
          )}
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            const content = (
              <span
                className={cn(
                  "relative flex min-h-[44px] min-w-0 items-center justify-center whitespace-nowrap rounded-xl px-2 py-3 text-center text-xs font-semibold leading-tight transition-all sm:min-h-[48px] sm:px-3 sm:text-sm md:text-base",
                  tab.disabled
                    ? "cursor-not-allowed text-slate-600"
                    : active
                      ? "bg-gradient-to-b from-brand-500/30 to-brand-600/10 text-brand-300 shadow-md shadow-brand-500/10 ring-1 ring-brand-500/30"
                      : tab.glow
                        ? "text-brand-300 ring-2 ring-brand-400/50 shadow-lg shadow-brand-500/20 animate-pulse-soft"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <span className="truncate sm:hidden">{tab.shortLabel ?? tab.label}</span>
                <span className="hidden truncate sm:inline">{tab.label}</span>
                {tab.badge && (
                  <span className="absolute -right-0.5 -top-0.5 rounded-full bg-brand-500 px-1 py-0.5 text-[8px] font-bold text-white">
                    !
                  </span>
                )}
              </span>
            );

            if (tab.disabled) {
              return (
                <span key={tab.href} className="min-w-0" title="Competition has ended">
                  {content}
                </span>
              );
            }

            return (
              <Link key={tab.href} href={tab.href} className="min-w-0">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
