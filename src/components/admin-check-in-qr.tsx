"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/site-brand";

export function AdminCheckInQr({ checkInUrl }: { checkInUrl: string }) {
  const [copied, setCopied] = useState(false);
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=400&data=${encodeURIComponent(checkInUrl)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=640,height=720");
    if (!printWindow) {
      alert("Allow pop-ups to print the QR code.");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${SITE_NAME} — Gym check-in QR</title>
  <style>
    body { font-family: system-ui, sans-serif; text-align: center; padding: 32px; color: #111; }
    h1 { font-size: 1.5rem; margin: 0 0 8px; }
    p { margin: 8px 0; line-height: 1.5; color: #444; max-width: 420px; margin-left: auto; margin-right: auto; }
    img { margin: 20px auto; display: block; width: 280px; height: 280px; }
    .url { font-size: 11px; word-break: break-all; color: #666; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Gym check-in</h1>
  <p><strong>Open your phone&apos;s Camera app</strong> and point it at this QR code to check in on ${SITE_NAME}.</p>
  <img src="${qrImage}" alt="Gym check-in QR code" width="280" height="280" />
  <p>3 visits per week earns bonus points.</p>
  <p class="url">${checkInUrl}</p>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  }

  return (
    <Card>
      <CardTitle>Gym check-in QR code</CardTitle>
      <p className="mt-1 text-sm text-slate-400">
        Print this at the front desk. Players use their phone&apos;s <strong className="text-slate-300">native Camera app</strong> to scan the QR at the gym and check in (3×/week for bonus points).
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
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm text-slate-400">
            Players: open <strong className="text-slate-200">Camera</strong> → scan → log in if prompted → check-in confirmed.
          </p>
          <p className="break-all text-xs text-slate-500">{checkInUrl}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="md" onClick={copyLink}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button type="button" size="md" onClick={handlePrint}>
              Print QR code
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
