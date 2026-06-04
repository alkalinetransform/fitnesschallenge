"use client";

import { useTransition } from "react";
import { saveEndMetricsDraft, sendPlayerEndMetrics, sendAllEndMetrics } from "@/actions/end-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EndMetricsPlayer = {
  id: string;
  name: string;
  sent: boolean;
  draft: {
    skeletalMuscleMass: number | null;
    weightLbs: number | null;
    bodyFatPercent: number | null;
    boneMass: number | null;
    muscleMass: number | null;
  };
};

export function AdminEndMetricsPanel({
  players,
  allComplete,
}: {
  players: EndMetricsPlayer[];
  allComplete: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="tile-orange rounded-2xl border p-4">
        <h2 className="font-display text-lg font-bold text-white">Enter end-of-challenge body data</h2>
        <p className="mt-1 text-sm text-slate-400">
          Surprise players with final skeletal muscle mass, weight, body fat %, bone mass, and muscle mass.
          Progress saves automatically as you type.
        </p>
      </div>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto scrollbar-brand pr-1">
        {players.map((p) => (
          <form
            key={p.id}
            className="glass-card space-y-3 p-4"
            action={(fd) => {
              fd.set("userId", p.id);
              startTransition(async () => {
                await saveEndMetricsDraft(fd);
              });
            }}
            onChange={(e) => {
              const form = e.currentTarget;
              const fd = new FormData(form);
              fd.set("userId", p.id);
              void saveEndMetricsDraft(fd);
            }}
          >
            <input type="hidden" name="userId" value={p.id} />
            <p className="font-semibold text-white">
              {p.name}
              {p.sent && (
                <span className="ml-2 text-xs font-normal text-emerald-400">· Data sent</span>
              )}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-xs">Skeletal muscle (lbs)</Label>
                <Input
                  name="skeletalMuscleMass"
                  type="number"
                  step="0.1"
                  defaultValue={p.draft.skeletalMuscleMass ?? ""}
                />
              </div>
              <div>
                <Label className="text-xs">Weight (lbs)</Label>
                <Input name="weightLbs" type="number" step="0.1" defaultValue={p.draft.weightLbs ?? ""} />
              </div>
              <div>
                <Label className="text-xs">Body fat %</Label>
                <Input
                  name="bodyFatPercent"
                  type="number"
                  step="0.1"
                  defaultValue={p.draft.bodyFatPercent ?? ""}
                />
              </div>
              <div>
                <Label className="text-xs">Bone mass</Label>
                <Input name="boneMass" type="number" step="0.1" defaultValue={p.draft.boneMass ?? ""} />
              </div>
              <div>
                <Label className="text-xs">Muscle mass</Label>
                <Input name="muscleMass" type="number" step="0.1" defaultValue={p.draft.muscleMass ?? ""} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="outline" size="md" disabled={pending}>
                Save draft
              </Button>
              {!p.sent && (
                <Button
                  type="button"
                  size="md"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await sendPlayerEndMetrics(p.id);
                      window.location.reload();
                    });
                  }}
                >
                  Send data to player
                </Button>
              )}
            </div>
          </form>
        ))}
      </div>

      {allComplete && (
        <Button
          type="button"
          size="lg"
          className="w-full"
          loading={pending}
          onClick={() => {
            if (!window.confirm("Release results to all players and archive this competition?")) return;
            startTransition(async () => {
              const r = await sendAllEndMetrics();
              if (r?.error) alert(r.error);
              else window.location.reload();
            });
          }}
        >
          Send all & release results
        </Button>
      )}
    </div>
  );
}
