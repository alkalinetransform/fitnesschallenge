"use client";

import { useState, useTransition } from "react";
import { createTeam } from "@/actions/teams";
import { Button } from "@/components/ui/button";

export function AddTeamButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="md"
        loading={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await createTeam();
            if (result?.error) setError(result.error);
            else window.location.reload();
          });
        }}
      >
        + Add team
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
