"use client";

import { useTransition } from "react";
import { dismissMessage } from "@/actions/messages";
import { Button } from "@/components/ui/button";

export function PlayerMessagePopup({
  messageId,
  body,
}: {
  messageId: string;
  body: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="glass-card relative flex max-h-[80vh] w-full max-w-md flex-col p-6">
        <div className="max-h-60 overflow-y-auto pr-2 text-sm leading-relaxed text-slate-200 scrollbar-brand">
          {body}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            size="lg"
            loading={pending}
            onClick={() => {
              startTransition(async () => {
                await dismissMessage(messageId);
                window.location.reload();
              });
            }}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
