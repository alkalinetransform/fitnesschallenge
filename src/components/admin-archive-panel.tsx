"use client";

import { useTransition } from "react";
import { archiveCompetitionResults } from "@/actions/end-metrics";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export function AdminArchivePanel({
  submittedCount,
  totalPlayers,
}: {
  submittedCount: number;
  totalPlayers: number;
}) {
  const [pending, startTransition] = useTransition();
  const allSubmitted = submittedCount >= totalPlayers && totalPlayers > 0;

  return (
    <Card className="border-brand-500/20">
      <CardTitle>Final metrics & archive</CardTitle>
      <p className="mt-1 text-sm text-slate-400">
        Players enter their own end-of-challenge metrics on the <strong className="text-slate-300">Me</strong>{" "}
        tab. Archive when everyone has submitted.
      </p>
      <p className="mt-3 text-sm font-medium text-white">
        {submittedCount} / {totalPlayers} players submitted
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-4"
        disabled={!allSubmitted}
        loading={pending}
        onClick={() => {
          if (
            !confirm(
              "Archive this competition and release final results for all players?"
            )
          ) {
            return;
          }
          startTransition(async () => {
            const result = await archiveCompetitionResults();
            if (result?.error) alert(result.error);
            else window.location.reload();
          });
        }}
      >
        Archive competition
      </Button>
    </Card>
  );
}
