"use client";

import { useState, useTransition } from "react";
import { submitPlayerEndMetrics } from "@/actions/end-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardTitle } from "@/components/ui/card";

export function PlayerEndMetricsForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-brand-500/30 bg-brand-500/5">
      <CardTitle>Enter your final metrics</CardTitle>
      <p className="mt-1 text-sm text-slate-400">
        The competition ended — add your updated body metrics to see your transformation results.
      </p>
      <form
        className="mt-4 space-y-4"
        action={(fd) => {
          setError(null);
          startTransition(async () => {
            const result = await submitPlayerEndMetrics(fd);
            if (result?.error) setError(result.error);
            else window.location.reload();
          });
        }}
      >
        <div>
          <Label htmlFor="skeletalMuscleMass">Skeletal muscle mass (lbs)</Label>
          <Input id="skeletalMuscleMass" name="skeletalMuscleMass" type="number" step="0.1" min="0" />
        </div>
        <div>
          <Label htmlFor="weightLbs">Weight (lbs)</Label>
          <Input id="weightLbs" name="weightLbs" type="number" step="0.1" min="0" />
        </div>
        <div>
          <Label htmlFor="bodyFatPercent">Body fat %</Label>
          <Input id="bodyFatPercent" name="bodyFatPercent" type="number" step="0.1" min="0" max="100" />
        </div>
        <p className="text-xs text-slate-500">Enter at least one metric.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" size="lg" loading={pending} className="w-full">
          Submit & see my results
        </Button>
      </form>
    </Card>
  );
}
