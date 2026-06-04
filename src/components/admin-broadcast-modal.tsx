"use client";

import { useState, useTransition } from "react";
import { sendBroadcastMessage } from "@/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminBroadcastModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button type="button" variant="outline" size="md" onClick={() => setOpen(true)}>
        Message players
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-card relative w-full max-w-lg p-6">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition hover:bg-red-500/20"
          aria-label="Cancel"
        >
          ✕
        </button>
        <h2 className="font-display text-lg font-bold text-white">Message players</h2>
        <form
          className="mt-4 space-y-4"
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              const result = await sendBroadcastMessage(fd);
              if (result?.error) setError(result.error);
              else {
                setOpen(false);
              }
            });
          }}
        >
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" name="sendToEmail" className="accent-brand-500" />
              Send to player email
            </label>
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" name="sendToInApp" defaultChecked className="accent-brand-500" />
              Show on login
            </label>
          </div>
          <Textarea name="body" rows={5} placeholder="Your message…" required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              loading={pending}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
