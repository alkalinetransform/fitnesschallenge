"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export function AdminCheckInQr({ checkInUrl }: { checkInUrl: string }) {
  const [copied, setCopied] = useState(false);
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardTitle>Gym check-in QR code</CardTitle>
      <p className="mt-1 text-sm text-slate-400">
        Print this at the front desk. Players scan to log visits (3×/week for bonus points).
      </p>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImage}
          alt="Gym check-in QR code"
          width={200}
          height={200}
          className="rounded-xl border border-white/10 bg-white p-2"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="break-all text-xs text-slate-500">{checkInUrl}</p>
          <Button type="button" variant="outline" size="md" onClick={copyLink}>
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
