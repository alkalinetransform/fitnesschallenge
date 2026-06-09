"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type CheckInResultData = {
  error?: string;
  success?: boolean;
  alreadyToday?: boolean;
  weekCount?: number;
  weekGoal?: number;
  pointsAwarded?: boolean;
  message?: string;
};

export function CheckInResult({ result }: { result: CheckInResultData }) {
  const isError = Boolean(result.error);
  const isSuccess = Boolean(result.success || result.alreadyToday);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="glass-card w-full max-w-sm p-8 text-center">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
            isError
              ? "bg-red-500/20"
              : isSuccess
                ? "bg-emerald-500/20"
                : "bg-brand-500/20"
          }`}
        >
          {isError ? "✕" : isSuccess ? "✓" : "🏋️"}
        </div>
        <h1 className="font-display text-xl font-bold text-white">
          {isError ? "Check-in failed" : result.alreadyToday ? "Already checked in" : "Checked in!"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {result.error ?? result.message}
        </p>
        {result.weekCount != null && result.weekGoal != null && (
          <p className="mt-3 text-lg font-bold text-brand-400">
            {result.weekCount} / {result.weekGoal} visits this week
          </p>
        )}
        {result.pointsAwarded && (
          <p className="mt-2 text-sm font-semibold text-emerald-400">Bonus points added!</p>
        )}
        <Link href="/dashboard" className="mt-6 block">
          <Button className="w-full" size="lg">
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
