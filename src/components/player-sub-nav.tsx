"use client";

import { EnvelopedTabs, type EnvelopedTab } from "@/components/enveloped-tabs";

export function PlayerSubNav({
  resultsReady,
  calendarWeek,
}: {
  resultsReady?: boolean;
  calendarWeek?: number;
}) {
  const tabs: EnvelopedTab[] = [
    {
      href: "/dashboard",
      label: "Challenges",
      shortLabel: "Tasks",
      match: (p) => p === "/dashboard",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      shortLabel: "Ranks",
      match: (p) => p.startsWith("/leaderboard"),
    },
    {
      href: "/dashboard/me",
      label: "Me",
      match: (p) => p.startsWith("/dashboard/me"),
      glow: resultsReady,
    },
  ];

  const leading =
    calendarWeek != null ? (
      <span className="truncate text-center text-[11px] font-bold text-brand-400 sm:text-xs">
        <span className="sm:hidden">Wk {calendarWeek}</span>
        <span className="hidden sm:inline">Week {calendarWeek}</span>
      </span>
    ) : undefined;

  return (
    <div>
      {resultsReady && (
        <p className="mx-auto max-w-4xl px-4 pt-2 text-center text-xs font-semibold text-brand-400 animate-pulse">
          See your results! → Me tab
        </p>
      )}
      <EnvelopedTabs tabs={tabs} ariaLabel="Player sections" leading={leading} />
    </div>
  );
}
