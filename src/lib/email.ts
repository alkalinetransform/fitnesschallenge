import crypto from "crypto";

export function createVerifyToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendVerificationEmail(email: string, token: string) {
  const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = `${base}/verify-email?token=${token}`;

  // Dev: log link. Production: plug in Resend/SendGrid.
  console.log("\n--- Email verification ---");
  console.log(`To: ${email}`);
  console.log(`Link: ${url}\n`);

  return { url };
}
