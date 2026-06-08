"use client";

import { useTransition } from "react";
import { setActiveWeek } from "@/actions/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WeekControl({
  defaultWeek,
  calendarWeek,
  maxWeek,
}: {
  defaultWeek: number;
  calendarWeek: number;
  maxWeek: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-brand-300">
        Current week: <span className="text-white">Week {calendarWeek}</span>
      </p>
      <form
        action={(fd) => {
          startTransition(async () => {
            await setActiveWeek(fd);
          });
        }}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-slate-900/40 p-3"
      >
        <div className="min-w-0 flex-1">
          <Label htmlFor="activeWeek" className="text-sm text-slate-400">
            Find a week
          </Label>
          <p className="text-[11px] text-slate-600">
            Weeks 1–{maxWeek} only · usually updates automatically from the calendar.
          </p>
          <Input
            id="activeWeek"
            name="activeWeek"
            type="number"
            min={1}
            max={maxWeek}
            defaultValue={defaultWeek}
            className="mt-1 w-24 border-white/10 bg-slate-950/50 text-center text-base"
          />
        </div>
        <Button type="submit" variant="outline" size="md" loading={pending}>
          Apply
        </Button>
      </form>
    </div>
  );
}
