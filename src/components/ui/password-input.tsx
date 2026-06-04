"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({
  id,
  name,
  minLength,
  required,
  className,
}: {
  id: string;
  name: string;
  minLength?: number;
  required?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        minLength={minLength}
        required={required}
        className="pr-20"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
