import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-brand-500/60 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
