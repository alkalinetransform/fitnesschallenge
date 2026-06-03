import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-card p-6 transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:shadow-brand-500/5",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-display text-lg font-semibold tracking-tight text-white",
        className
      )}
      {...props}
    />
  );
}
