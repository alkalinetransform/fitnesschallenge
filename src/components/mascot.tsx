import Image from "next/image";
import { cn } from "@/lib/utils";

export const MASCOT_SRC = "/mascot.png";

export type MascotAnimation = "none" | "bounce" | "wave" | "float" | "celebrate" | "wiggle";

const animationClass: Record<MascotAnimation, string> = {
  none: "",
  bounce: "animate-mascot-bounce",
  wave: "animate-mascot-wave",
  float: "animate-mascot-float",
  celebrate: "animate-mascot-celebrate",
  wiggle: "animate-mascot-wiggle",
};

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
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={MASCOT_SRC}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className={cn(
          "h-auto w-full object-contain mix-blend-screen drop-shadow-[0_6px_20px_rgba(249,115,22,0.45)]",
          animationClass[animation]
        )}
      />
    </div>
  );
}

export function MascotLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mascot size={40} animation="wiggle" className="!h-10 !w-10" />
      <span className="min-w-0">
        <span className="font-display text-lg font-bold tracking-tight">
          <span className="gradient-text">Fit</span>
          <span className="text-white">Challenge</span>
        </span>
        <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-400/80">
          Squeeze the day
        </span>
      </span>
    </span>
  );
}
