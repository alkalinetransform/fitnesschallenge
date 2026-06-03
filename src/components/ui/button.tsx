"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { ButtonDots } from "./button-dots";

type Variant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out " +
  "rounded-xl border outline-none " +
  "focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 " +
  "active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:active:scale-100";

const variants: Record<Variant, string> = {
  default:
    "tile-orange border-brand-500/25 text-white " +
    "hover:border-brand-500/45 hover:from-brand-500/30 hover:to-brand-600/12 " +
    "active:border-brand-600/50 active:from-brand-600/35 active:to-brand-700/15 " +
    "data-[loading=true]:border-brand-600/50 data-[loading=true]:from-brand-600/35 data-[loading=true]:to-brand-700/15",
  secondary:
    "tile-emerald border-emerald-500/25 text-white " +
    "hover:border-emerald-500/45 hover:from-emerald-500/30 " +
    "active:border-emerald-600/50 active:from-emerald-600/35 " +
    "data-[loading=true]:border-emerald-600/50 data-[loading=true]:from-emerald-600/35",
  outline:
    "tile-slate border-white/15 text-slate-100 " +
    "hover:border-white/30 hover:from-slate-700/55 " +
    "active:border-brand-500/35 active:from-slate-800/70 " +
    "data-[loading=true]:border-brand-500/30 data-[loading=true]:from-slate-800/70",
  ghost:
    "border-transparent bg-transparent text-slate-300 shadow-none " +
    "hover:border-white/15 hover:bg-white/10 hover:text-white " +
    "active:bg-white/15 active:text-white " +
    "data-[loading=true]:bg-white/10",
  destructive:
    "tile-red border-red-500/30 text-white " +
    "hover:border-red-500/50 hover:from-red-500/25 " +
    "active:border-red-600/55 active:from-red-600/35 " +
    "data-[loading=true]:border-red-600/55 data-[loading=true]:from-red-600/35",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-4 py-2 text-sm",
  md: "min-h-11 px-6 py-2.5 text-base",
  lg: "min-h-13 px-8 py-3.5 text-lg",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
  }
>(({ className, variant = "default", size = "md", loading, disabled, children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    data-loading={loading ? "true" : undefined}
    className={cn(base, variants[variant], sizes[size], className)}
    {...props}
  >
    {loading ? (
      <>
        <ButtonDots />
        <span className="sr-only">Loading</span>
        {typeof children === "string" ? children : null}
      </>
    ) : (
      children
    )}
  </button>
));
Button.displayName = "Button";
