"use client";

import { useState, useTransition } from "react";
import { toggleCompletion } from "@/actions/completions";
import { cn } from "@/lib/utils";

export function ChallengeCheckbox({
  challengeId,
  challengeName,
  defaultChecked,
  disabled = false,
}: {
  challengeId: string;
  challengeName: string;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useState(defaultChecked);
  const isDisabled = disabled || pending;

  function handleClick() {
    if (disabled) return;

    const next = !checked;
    const message = next
      ? `Complete "${challengeName}"?\n\nOnly confirm if you actually finished this challenge.`
      : `Remove completion for "${challengeName}"?`;

    if (!window.confirm(message)) return;

    setChecked(next);
    startTransition(async () => {
      const result = await toggleCompletion(challengeId, next);
      if (result?.error) setChecked(!next);
    });
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ease-out",
        checked
          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20"
          : "border-white/20 bg-white/5 text-transparent hover:border-brand-500/50 hover:bg-brand-500/10 hover:scale-105",
        isDisabled && "opacity-50 cursor-not-allowed",
        pending && "animate-pulse"
      )}
    >
      <svg
        className={cn(
          "h-4 w-4 transition-all duration-300",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}
