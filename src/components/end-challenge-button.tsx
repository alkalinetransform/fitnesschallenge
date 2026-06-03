"use client";

import { useTransition } from "react";
import { endChallenge } from "@/actions/gym";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EndChallengeButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="lg"
      loading={pending}
      className={cn("w-full", className)}
      onClick={() => {
        const ok = window.confirm(
          "Finish this competition?\n\nAll scores will be locked. Players can no longer complete challenges, and final standings will be shown on the leaderboard.\n\nThis cannot be undone."
        );
        if (!ok) return;
        startTransition(async () => {
          await endChallenge();
          window.location.reload();
        });
      }}
    >
      Finish competition & lock scores
    </Button>
  );
}
