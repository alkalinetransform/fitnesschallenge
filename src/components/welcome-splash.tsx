"use client";

import { useEffect, useState } from "react";
import { markWelcomeSeen } from "@/actions/profile";
import { Mascot } from "@/components/mascot";

export function WelcomeSplash({
  show,
  onDone,
}: {
  show: boolean;
  onDone?: () => void;
}) {
  const [visible, setVisible] = useState(show);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!show) return;
    const fadeTimer = setTimeout(() => setFade(true), 2400);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      void markWelcomeSeen().then(() => onDone?.());
    }, 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
      aria-live="polite"
    >
      <div className="mx-4 max-w-md text-center">
        <Mascot size={140} animation="celebrate" className="mx-auto mb-4" />
        <p
          className="font-display text-2xl font-bold italic tracking-tight text-brand-400 sm:text-3xl"
          style={{ textShadow: "0 0 40px rgba(249,115,22,0.35)" }}
        >
          Welcome to the transformation challenge
        </p>
        <p className="mt-2 text-sm text-slate-400">Squeeze is pumped you&apos;re here!</p>
        <div className="mx-auto mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600 bg-[length:200%_100%]" />
        </div>
        <p className="mt-4 text-sm text-slate-500">Preparing your dashboard…</p>
      </div>
    </div>
  );
}
