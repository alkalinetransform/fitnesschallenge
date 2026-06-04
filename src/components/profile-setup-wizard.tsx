"use client";

import { useState, useTransition } from "react";
import { saveProfileSetup } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GreenSlider({
  id,
  name,
  label,
  min,
  max,
  step,
  defaultValue,
  format,
}: {
  id: string;
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  format: (v: number) => string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-semibold text-emerald-400">{format(value)}</span>
      </div>
      <input type="hidden" name={name} value={value} />
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-emerald-500"
      />
    </div>
  );
}

export function ProfileSetupWizard() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
      <div className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 scrollbar-brand">
        <h2 className="font-display text-xl font-bold text-white">Set up your account</h2>
        <p className="mt-1 text-sm text-slate-400">
          Tell us where you&apos;re starting — this becomes your &quot;beginning of transformation&quot; data.
        </p>
        <form
          className="mt-6 space-y-5"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const result = await saveProfileSetup(fd);
              if (result?.error) setError(result.error);
              else window.location.reload();
            });
          }}
        >
          <GreenSlider
            id="steps"
            name="stepsPerDay"
            label="Approximate steps per day"
            min={1000}
            max={20000}
            step={500}
            defaultValue={6000}
            format={(v) => `${v.toLocaleString()} steps`}
          />
          <GreenSlider
            id="water"
            name="waterOzPerDay"
            label="Water per day"
            min={16}
            max={128}
            step={8}
            defaultValue={64}
            format={(v) => `${v} oz`}
          />
          <div>
            <Label htmlFor="smm">Skeletal muscle mass (lbs)</Label>
            <Input id="smm" name="startSkeletalMuscleMass" type="number" step="0.1" required />
          </div>
          <div>
            <Label htmlFor="weight">Current weight (lbs)</Label>
            <Input id="weight" name="startWeightLbs" type="number" step="0.1" required />
          </div>
          <div>
            <Label htmlFor="bf">Body fat percentage</Label>
            <Input id="bf" name="startBodyFatPercent" type="number" step="0.1" required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={pending}>
            Save & continue
          </Button>
        </form>
      </div>
    </div>
  );
}
