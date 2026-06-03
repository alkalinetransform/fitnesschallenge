"use client";

import { useTransition } from "react";
import { setActiveWeek } from "@/actions/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WeekControl({ defaultWeek }: { defaultWeek: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          await setActiveWeek(fd);
        });
      }}
      className="tile-orange flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Label htmlFor="activeWeek" className="text-brand-200/90">
          Competition week
        </Label>
        <Input
          id="activeWeek"
          name="activeWeek"
          type="number"
          min={1}
          max={52}
          defaultValue={defaultWeek}
          className="mt-1 w-full border-brand-500/20 bg-slate-950/40 py-3 text-center text-xl font-bold"
        />
      </div>
      <Button type="submit" variant="default" size="lg" loading={pending} className="w-full sm:min-w-[140px]">
        Set week
      </Button>
    </form>
  );
}
