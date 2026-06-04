"use client";

import { useEffect, useState } from "react";

const COLORS = ["#f97316", "#fb923c", "#34d399", "#a78bfa", "#f472b6"];

export function ConfettiCelebration({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (!active) return;
    setPieces(
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: COLORS[i % COLORS.length]!,
      }))
    );
    const t = setTimeout(() => setPieces([]), 4500);
    return () => clearTimeout(t);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 h-2 w-1.5 rounded-sm opacity-90"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
