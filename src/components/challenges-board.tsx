"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteChallenge } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChallengeRow = {
  id: string;
  name: string;
  description: string;
  points: number;
  durationDays: number;
  startDate: string;
  expiresAt: string;
  index: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ChallengeCard({
  c,
  active,
  compact,
  canDelete,
}: {
  c: ChallengeRow;
  active: boolean;
  compact?: boolean;
  canDelete: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`glass-card flex flex-col border bg-gradient-to-br p-4 transition-all duration-300 ${
        active
          ? "border-brand-500/30 from-brand-500/15 to-brand-600/5"
          : "border-white/10 from-slate-800/40 to-slate-900/30 opacity-90"
      } ${compact ? "min-h-0" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-slate-500">#{c.index}</span>
        <span className="shrink-0 rounded-full border border-brand-500/30 bg-brand-500/15 px-2 py-0.5 text-xs font-bold text-brand-400">
          {c.points} pts
        </span>
      </div>
      <h3 className={`font-display font-semibold text-white ${compact ? "text-sm" : ""}`}>{c.name}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-400 line-clamp-2">{c.description}</p>
      <p className="mt-2 text-xs text-slate-500">
        {formatDate(c.startDate)} → {formatDate(c.expiresAt)}
      </p>
      <p className="text-xs text-slate-500">
        {c.durationDays} day{c.durationDays !== 1 ? "s" : ""}
        {active ? " · current" : " · archived"}
      </p>
      {canDelete && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          loading={pending}
          className="mt-3 w-full"
          onClick={() => {
            const ok = window.confirm(
              `Delete "${c.name}" for everyone?\n\nThis permanently removes the challenge and deletes all points players already earned from it. This cannot be undone.`
            );
            if (!ok) return;
            const fd = new FormData();
            fd.set("id", c.id);
            startTransition(async () => {
              await deleteChallenge(fd);
            });
          }}
        >
          Delete
        </Button>
      )}
    </div>
  );
}

function ChallengeSection({
  title,
  subtitle,
  items,
  search,
  onSearch,
  canDelete,
  compact,
  pageSize,
}: {
  title: string;
  subtitle: string;
  items: ChallengeRow[];
  search: string;
  onSearch: (v: string) => void;
  canDelete: boolean;
  compact?: boolean;
  pageSize: number;
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        String(c.index).includes(q)
    );
  }, [items, search]);

  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const now = Date.now();

  return (
    <section className={compact ? "mt-8" : ""}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={`font-display font-bold text-white ${compact ? "text-lg" : "text-xl"}`}>
            {title}
          </h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {items.length > 0 && (
          <Input
            value={search}
            onChange={(e) => {
              onSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search challenges…"
            className="max-w-xs"
          />
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No challenges in this section.</p>
      ) : (
        <>
          <div
            className={`grid gap-3 scroll-smooth scrollbar-brand sm:grid-cols-2 ${
              compact ? "max-h-[520px] overflow-y-auto pr-1" : ""
            }`}
          >
            {slice.map((c) => (
              <ChallengeCard
                key={c.id}
                c={c}
                active={new Date(c.startDate).getTime() <= now && new Date(c.expiresAt).getTime() > now}
                compact={compact}
                canDelete={canDelete}
              />
            ))}
          </div>
          {filtered.length > pageSize && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-500">
                {safePage + 1} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function ChallengesBoard({
  current,
  archived,
  competitionEnded,
}: {
  current: ChallengeRow[];
  archived: ChallengeRow[];
  competitionEnded: boolean;
}) {
  const [currentSearch, setCurrentSearch] = useState("");
  const [archivedSearch, setArchivedSearch] = useState("");

  return (
    <div className="space-y-6">
      <ChallengeSection
        title="Current challenges"
        subtitle="Active and upcoming tasks in this competition"
        items={current}
        search={currentSearch}
        onSearch={setCurrentSearch}
        canDelete={!competitionEnded}
        pageSize={4}
      />
      <ChallengeSection
        title="Archived challenges"
        subtitle="Expired tasks — moved here automatically when duration ends"
        items={archived}
        search={archivedSearch}
        onSearch={setArchivedSearch}
        canDelete={!competitionEnded}
        compact
        pageSize={4}
      />
    </div>
  );
}
