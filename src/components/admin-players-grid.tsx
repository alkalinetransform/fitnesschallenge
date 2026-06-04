"use client";

import { useMemo, useState, useTransition } from "react";
import { setPlayerFrozenForm, deletePlayerForm } from "@/actions/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AdminPlayerRow = {
  id: string;
  name: string;
  email: string;
  isFrozen: boolean;
  isNew: boolean;
  teamName: string | null;
  points: number;
};

export function AdminPlayersGrid({ players }: { players: AdminPlayerRow[] }) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.teamName?.toLowerCase().includes(q) ?? false)
    );
  }, [players, query]);

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search players…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
      <div className="max-h-[520px] overflow-y-auto scrollbar-brand pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={cn(
                "glass-card relative flex flex-col gap-2 p-3 text-sm",
                p.isFrozen && "opacity-50 grayscale-[0.35]"
              )}
            >
              {p.isNew && (
                <span className="absolute right-2 top-2 rounded border border-red-500/50 bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-300">
                  New
                </span>
              )}
              <p className="truncate font-semibold text-white pr-10">{p.name}</p>
              <p className="truncate text-[10px] text-slate-500">{p.email}</p>
              <p className="text-xs text-brand-400">{p.points} pts</p>
              <p
                className={cn(
                  "truncate text-[10px] font-medium",
                  p.teamName ? "text-emerald-400/90" : "text-amber-400/90"
                )}
              >
                {p.teamName ?? "Unassigned"}
              </p>
              <form action={setPlayerFrozenForm} className="mt-auto">
                <input type="hidden" name="userId" value={p.id} />
                <input type="hidden" name="frozen" value={p.isFrozen ? "false" : "true"} />
                <Button
                  type="submit"
                  variant={p.isFrozen ? "secondary" : "outline"}
                  size="md"
                  className="w-full text-xs"
                  disabled={pending}
                >
                  {p.isFrozen ? "Unfreeze" : "Freeze"}
                </Button>
              </form>
              <form
                action={(fd) => {
                  if (
                    !window.confirm(
                      `Delete ${p.name}'s account permanently? This cannot be undone.`
                    )
                  ) {
                    return;
                  }
                  startTransition(async () => {
                    await deletePlayerForm(fd);
                  });
                }}
              >
                <input type="hidden" name="userId" value={p.id} />
                <Button type="submit" variant="destructive" size="md" className="w-full text-xs">
                  Delete
                </Button>
              </form>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No players match your search.</p>
        )}
      </div>
    </div>
  );
}
