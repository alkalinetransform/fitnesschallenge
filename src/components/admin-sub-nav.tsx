"use client";

import { EnvelopedTabs, type EnvelopedTab } from "@/components/enveloped-tabs";

export function AdminSubNav({ competitionEnded }: { competitionEnded: boolean }) {
  const tabs: EnvelopedTab[] = [
    { href: "/admin", label: "Dashboard", match: (p) => p === "/admin" },
    {
      href: "/admin/challenges",
      label: "Challenges",
      match: (p) => p.startsWith("/admin/challenges"),
      disabled: competitionEnded,
    },
    {
      href: "/admin/teams",
      label: "Teams",
      match: (p) => p.startsWith("/admin/teams"),
      disabled: competitionEnded,
    },
    {
      href: "/admin/players",
      label: "Players",
      match: (p) => p.startsWith("/admin/players"),
      disabled: competitionEnded,
    },
    { href: "/leaderboard", label: "Leaderboard", match: (p) => p.startsWith("/leaderboard") },
  ];

  return <EnvelopedTabs tabs={tabs} ariaLabel="Admin sections" />;
}
