"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Dashboard", match: (p: string) => p === "/admin" },
  {
    href: "/admin/challenges",
    label: "Challenges",
    match: (p: string) => p.startsWith("/admin/challenges"),
  },
  {
    href: "/admin/teams",
    label: "Teams",
    match: (p: string) => p.startsWith("/admin/teams"),
  },
  {
    href: "/admin/players",
    label: "Players",
    match: (p: string) => p.startsWith("/admin/players"),
  },
] as const;

export function AdminSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-white/10 bg-slate-950/60 backdrop-blur-md"
      aria-label="Admin sections"
    >
      <div className="mx-auto flex max-w-4xl gap-0.5 overflow-x-auto px-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "text-brand-400"
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              {tab.label}
              {active && (
                <span
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-500"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
