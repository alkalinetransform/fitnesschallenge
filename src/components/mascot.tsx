"use client";

import Image from "next/image";
import { SITE_TAGLINE } from "@/lib/site-brand";
import { cn } from "@/lib/utils";
import mascotImage from "@/assets/mascot.png";

export const MASCOT_SRC = mascotImage.src;

export type MascotAnimation = "none" | "bounce" | "wave" | "float" | "celebrate" | "wiggle";

const animationClass: Record<MascotAnimation, string> = {
  none: "",
  bounce: "animate-mascot-bounce",
  wave: "animate-mascot-wave",
  float: "animate-mascot-float",
  celebrate: "animate-mascot-celebrate",
  wiggle: "animate-mascot-wiggle",
};

const imageClassName =
  "object-contain mix-blend-screen drop-shadow-[0_6px_20px_rgba(249,115,22,0.45)]";

export function Mascot({
  size = 120,
  animation = "float",
  className,
  priority,
  alt = "Squeeze the day mascot",
}: {
  size?: number;
  animation?: MascotAnimation;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        animationClass[animation],
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Animation on wrapper only — blend mode on image avoids render glitches. */}
      <div className="relative h-full w-full [isolation:isolate]">
        <Image
          src={mascotImage}
          alt={alt}
          fill
          sizes={`${size}px`}
          priority={priority}
          className={imageClassName}
        />
      </div>
    </div>
  );
}

export function MascotLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mascot size={40} animation="wiggle" className="!h-10 !w-10" priority />
      <span className="min-w-0">
        <span className="font-display text-lg font-bold tracking-tight">
          <span className="gradient-text">Alkaline</span>
          <span className="text-white">Fitness</span>
        </span>
        <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-400/80">
          {SITE_TAGLINE}
        </span>
      </span>
    </span>
  );
}
