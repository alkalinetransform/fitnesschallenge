import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthShell title="Welcome back" subtitle="Squeeze the day">
      <Card>
        <CardTitle>Log in</CardTitle>
        <LoginForm callbackUrl={callbackUrl} />
        <p className="mt-4 text-center text-sm text-slate-400">
          <Link href="/register" className="text-brand-400 hover:text-brand-300">
            Player signup
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
