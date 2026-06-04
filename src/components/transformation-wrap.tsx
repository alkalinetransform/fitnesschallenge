"use client";

import { useState } from "react";
import { markResultsWrapSeen } from "@/actions/profile";
import { BodyMetricsDisplay } from "@/components/body-metrics-display";
import { Button } from "@/components/ui/button";

const ENCOURAGEMENTS = [
  "You showed up — and it shows.",
  "Small habits, big transformation.",
  "Your future self is cheering right now.",
  "Consistency beats intensity. You proved it.",
];

export function TransformationWrap({
  competitionName,
  habits,
  start,
  end,
  onClose,
}: {
  competitionName: string;
  habits: string[];
  start: {
    skeletalMuscleMass: number | null;
    weightLbs: number | null;
    bodyFatPercent: number | null;
    stepsPerDay: number | null;
    waterOzPerDay: number | null;
  };
  end: {
    skeletalMuscleMass: number | null;
    weightLbs: number | null;
    bodyFatPercent: number | null;
  };
  onClose?: () => void;
}) {
  const [step, setStep] = useState(0);
  const quote = ENCOURAGEMENTS[step % ENCOURAGEMENTS.length];

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/98 p-4 backdrop-blur-md">
      <div className="mx-auto max-w-lg space-y-6 py-8 animate-fade-in-up">
        <p className="text-center text-xs uppercase tracking-widest text-brand-400">{competitionName}</p>
        <h2 className="text-center font-display text-3xl font-bold italic text-brand-400">
          Your transformation wrap
        </h2>
        <p className="text-center text-sm text-slate-400">{quote}</p>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-center text-sm text-slate-300">Where you started</p>
            <BodyMetricsDisplay {...start} variant="start" />
            <p className="text-center text-xs text-slate-500">
              {start.stepsPerDay != null && `${start.stepsPerDay.toLocaleString()} steps/day · `}
              {start.waterOzPerDay != null && `${start.waterOzPerDay} oz water/day`}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-sm text-emerald-300">Where you landed (surprise!)</p>
            <BodyMetricsDisplay {...end} variant="end" />
          </div>
        )}

        {step === 2 && (
          <div className="glass-card p-6">
            <p className="font-display text-lg font-bold text-white">Habits you built</p>
            {habits.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Keep completing challenges to build your habit story.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {habits.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-center gap-3">
          {step < 2 ? (
            <Button type="button" size="lg" onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  void markResultsWrapSeen();
                  window.location.reload();
                }
              }}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
