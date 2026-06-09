import crypto from "crypto";
import nodemailer from "nodemailer";

export const ADMIN_FROM_EMAIL =
  process.env.ADMIN_FROM_EMAIL?.trim() || "alkalinetransform@gmail.com";

export function createVerifyToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function normalizeAppPassword(raw: string): string {
  return raw.replace(/\s+/g, "");
}

function createMailTransport() {
  const smtpUrl = process.env.SMTP_URL?.trim();
  if (smtpUrl) {
    return nodemailer.createTransport(smtpUrl);
  }

  const user = process.env.GMAIL_USER?.trim() || ADMIN_FROM_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass: normalizeAppPassword(pass),
    },
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = `${base}/verify-email?token=${token}`;

  console.log("\n--- Email verification ---");
  console.log(`To: ${email}`);
  console.log(`Link: ${url}\n`);

  return { url };
}

export type EmailSendResult =
  | { sent: true }
  | { sent: false; logged: true }
  | { sent: false; error: string };

export async function sendBroadcastEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): Promise<EmailSendResult> {
  const transport = createMailTransport();
  const from = `Alkaline Fitness <${ADMIN_FROM_EMAIL}>`;
  const dashboardUrl =
    (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000") +
    "/dashboard";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <p style="color:#f97316;font-weight:700;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Squeeze the day</p>
      <h2 style="color:#0f172a;margin:8px 0 16px;">Message from your gym</h2>
      <div style="color:#334155;line-height:1.6;white-space:pre-wrap;">${escapeHtml(body)}</div>
      <p style="margin-top:24px;">
        <a href="${dashboardUrl}" style="background:#f97316;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Open FitChallenge</a>
      </p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Sent from ${ADMIN_FROM_EMAIL}</p>
    </div>
  `;

  if (!transport) {
    console.log("\n--- Broadcast email (dev — set GMAIL_APP_PASSWORD to send) ---");
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(body.slice(0, 200));
    return { sent: false, logged: true };
  }

  try {
    await transport.sendMail({
      from,
      to,
      replyTo: ADMIN_FROM_EMAIL,
      subject,
      text: `${body}\n\nOpen your dashboard: ${dashboardUrl}`,
      html,
    });
    return { sent: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Email delivery failed";
    console.error("Broadcast email error:", msg);
    if (msg.includes("535") || msg.includes("BadCredentials")) {
      return {
        sent: false,
        error:
          "Gmail rejected the login. Use a Google App Password (not your regular password) for GMAIL_APP_PASSWORD, with 2-Step Verification enabled.",
      };
    }
    return { sent: false, error: msg };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
