"use client";

import { useState } from "react";
import { TransformationWrap } from "@/components/transformation-wrap";

type ArchiveEntry = {
  userId: string;
  name: string;
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
  habits: string[];
};

export function PastWrapViewer({
  archives,
}: {
  archives: {
    id: string;
    name: string;
    endedAt: string;
    snapshotJson: string;
    userId: string;
  }[];
}) {
  const [viewing, setViewing] = useState<{
    name: string;
    entry: ArchiveEntry;
  } | null>(null);

  return (
    <div className="mt-3 space-y-2">
      {archives.map((a) => {
        const snapshot = JSON.parse(a.snapshotJson) as ArchiveEntry[];
        const entry = snapshot.find((s) => s.userId === a.userId);
        if (!entry) return null;
        const date = new Date(a.endedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => setViewing({ name: a.name, entry })}
            className="glass-card w-full p-4 text-left transition hover:border-brand-500/30"
          >
            <p className="font-semibold text-white">{a.name}</p>
            <p className="text-xs text-slate-500">{date}</p>
          </button>
        );
      })}
      {viewing && (
        <TransformationWrap
          competitionName={viewing.name}
          habits={viewing.entry.habits}
          start={viewing.entry.start}
          end={viewing.entry.end}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
