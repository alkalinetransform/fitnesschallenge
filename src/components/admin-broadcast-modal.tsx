"use client";

import { useMemo, useState, useTransition } from "react";
import { sendBroadcastMessage } from "@/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PlayerOption = { id: string; name: string; email: string };

export function AdminBroadcastModal({ players }: { players: PlayerOption[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PlayerOption[]>([]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const selectedIds = new Set(selected.map((p) => p.id));
    return players
      .filter((p) => !selectedIds.has(p.id))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [players, search, selected]);

  function addRecipient(player: PlayerOption) {
    setSelected((prev) => [...prev, player]);
    setSearch("");
  }

  function removeRecipient(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="md" onClick={() => setOpen(true)}>
        Message players
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-card relative flex max-h-[90vh] w-full max-w-xl flex-col p-6">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition hover:bg-red-500/20"
          aria-label="Cancel"
        >
          ✕
        </button>
        <h2 className="font-display text-lg font-bold text-white">New message</h2>

        <form
          className="mt-4 flex min-h-0 flex-1 flex-col gap-4"
          action={(fd) => {
            setError(null);
            for (const p of selected) {
              fd.append("recipientIds", p.id);
            }
            startTransition(async () => {
              const result = await sendBroadcastMessage(fd);
              if (result?.error) setError(result.error);
              else {
                setOpen(false);
                setSelected([]);
                setSearch("");
              }
            });
          }}
        >
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
            <div className="flex flex-wrap items-start gap-2">
              <span className="pt-1.5 text-sm font-medium text-slate-400">To</span>
              {selected.length === 0 && (
                <span className="rounded-full border border-dashed border-white/20 px-2 py-1 text-xs text-slate-500">
                  All players (leave empty)
                </span>
              )}
              {selected.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-1 text-xs text-brand-200"
                >
                  {p.name}
                  <button
                    type="button"
                    onClick={() => removeRecipient(p.id)}
                    className="text-slate-400 hover:text-white"
                    aria-label={`Remove ${p.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players by name or email…"
              className="mt-2 border-white/5 bg-slate-950/50 text-base"
              autoComplete="off"
            />
            {search.trim() && suggestions.length > 0 && (
              <ul className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-white/10 bg-slate-950 scrollbar-brand">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => addRecipient(p)}
                      className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-white/5"
                    >
                      <span className="font-medium text-white">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" name="sendToEmail" className="accent-brand-500" />
              Send to player email
            </label>
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" name="sendToInApp" defaultChecked className="accent-brand-500" />
              Show on login
            </label>
          </div>

          <Textarea
            name="body"
            rows={6}
            placeholder="Write your message…"
            required
            className="min-h-[120px] flex-1 text-base"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              loading={pending}
              className={cn("bg-emerald-600 hover:bg-emerald-500")}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
