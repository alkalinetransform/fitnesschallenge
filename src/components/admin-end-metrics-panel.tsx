"use client";

import { useRef, useState, useTransition } from "react";
import {
  saveEndMetricsDraft,
  sendPlayerEndMetrics,
  sendAllPlayerData,
  sendAllEndMetrics,
} from "@/actions/end-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type EndMetricsPlayer = {
  id: string;
  name: string;
  sent: boolean;
  draft: {
    skeletalMuscleMass: number | null;
    weightLbs: number | null;
    bodyFatPercent: number | null;
  };
};

function PlayerMetricsCard({
  player,
  pending,
}: {
  player: EndMetricsPlayer;
  pending: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [expanded, setExpanded] = useState(!player.sent);
  const [sent, setSent] = useState(player.sent);
  const [, startTransition] = useTransition();

  if (!expanded && sent) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="glass-card flex w-full items-center justify-between border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-left transition hover:border-emerald-500/50"
      >
        <span className="font-semibold text-white">{player.name}</span>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
          ✓ Data sent
        </span>
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      className={cn(
        "glass-card space-y-3 border p-4",
        sent ? "border-emerald-500/25" : "border-brand-500/20"
      )}
      onChange={() => {
        if (formRef.current) {
          const fd = new FormData(formRef.current);
          fd.set("userId", player.id);
          void saveEndMetricsDraft(fd);
        }
      }}
    >
      <input type="hidden" name="userId" value={player.id} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-white">{player.name}</p>
        {sent && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Collapse
          </button>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Skeletal muscle (lbs)</Label>
          <Input
            name="skeletalMuscleMass"
            type="number"
            step="0.1"
            defaultValue={player.draft.skeletalMuscleMass ?? ""}
            className="text-base"
          />
        </div>
        <div>
          <Label className="text-xs">Weight (lbs)</Label>
          <Input
            name="weightLbs"
            type="number"
            step="0.1"
            defaultValue={player.draft.weightLbs ?? ""}
            className="text-base"
          />
        </div>
        <div>
          <Label className="text-xs">Body fat %</Label>
          <Input
            name="bodyFatPercent"
            type="number"
            step="0.1"
            defaultValue={player.draft.bodyFatPercent ?? ""}
            className="text-base"
          />
        </div>
      </div>
      <Button
        type="button"
        size="md"
        disabled={pending}
        loading={pending}
        onClick={() => {
          if (!formRef.current) return;
          const fd = new FormData(formRef.current);
          fd.set("userId", player.id);
          startTransition(async () => {
            await saveEndMetricsDraft(fd);
            const r = await sendPlayerEndMetrics(player.id);
            if (r?.error) alert(r.error);
            else {
              setSent(true);
              setExpanded(false);
            }
          });
        }}
      >
        {sent ? "Resend data to player" : "Send data to player"}
      </Button>
    </form>
  );
}

export function AdminEndMetricsPanel({
  players,
  allComplete,
}: {
  players: EndMetricsPlayer[];
  allComplete: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4 rounded-2xl border-2 border-brand-500/40 bg-brand-500/5 p-4">
      <div>
        <h2 className="font-display text-xl font-bold text-brand-300">End-of-challenge body data</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter skeletal muscle mass, weight, and body fat % for each player. Data auto-saves as you
          type.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        loading={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Send body data to ALL players who have metrics entered?\n\nPlayers will be able to see their results."
            )
          )
            return;
          startTransition(async () => {
            const r = await sendAllPlayerData();
            if (r?.error) alert(r.error);
            else window.location.reload();
          });
        }}
      >
        Send all player data
      </Button>

      <div className="max-h-[60vh] space-y-2 overflow-y-auto scrollbar-brand pr-1">
        {players.map((p) => (
          <PlayerMetricsCard key={p.id} player={p} pending={pending} />
        ))}
      </div>

      {allComplete && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full border-emerald-500/40"
          loading={pending}
          onClick={() => {
            if (
              !window.confirm(
                "Release final results to everyone and archive this competition?\n\nThis marks the competition complete."
              )
            )
              return;
            startTransition(async () => {
              const r = await sendAllEndMetrics();
              if (r?.error) alert(r.error);
              else window.location.reload();
            });
          }}
        >
          Archive competition & release final results
        </Button>
      )}
    </div>
  );
}
