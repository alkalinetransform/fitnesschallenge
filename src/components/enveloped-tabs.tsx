"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type EnvelopedTab = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  disabled?: boolean;
  badge?: string;
  glow?: boolean;
};

export function EnvelopedTabs({ tabs, ariaLabel }: { tabs: EnvelopedTab[]; ariaLabel: string }) {
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-white/10 bg-slate-950/70 backdrop-blur-md"
      aria-label={ariaLabel}
    >
      <div className="mx-auto max-w-4xl overflow-x-hidden px-3 py-2 sm:px-4">
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-slate-900/80 p-1 shadow-inner shadow-black/20">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            const content = (
              <span
                className={cn(
                  "relative block rounded-xl px-3 py-2.5 text-center text-xs font-semibold transition-all sm:px-4 sm:text-sm",
                  tab.disabled
                    ? "cursor-not-allowed text-slate-600"
                    : active
                      ? "bg-gradient-to-b from-brand-500/30 to-brand-600/10 text-brand-300 shadow-md shadow-brand-500/10 ring-1 ring-brand-500/30"
                      : tab.glow
                        ? "text-brand-300 ring-2 ring-brand-400/50 shadow-lg shadow-brand-500/20 animate-pulse-soft"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                {tab.label}
                {tab.badge && (
                  <span className="absolute -right-0.5 -top-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </span>
            );

            if (tab.disabled) {
              return (
                <span key={tab.href} className="min-w-0 flex-1" title="Competition has ended">
                  {content}
                </span>
              );
            }

            return (
              <Link key={tab.href} href={tab.href} className="min-w-0 flex-1">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
