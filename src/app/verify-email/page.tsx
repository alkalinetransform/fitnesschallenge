import Link from "next/link";
import { verifyEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardTitle>Invalid link</CardTitle>
          <p className="mt-2 text-sm text-slate-400">This verification link is not valid.</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Log in</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const result = await verifyEmail(token);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 animate-fade-in">
      <Card className="max-w-md text-center">
        {"error" in result && result.error ? (
          <>
            <CardTitle>Verification failed</CardTitle>
            <p className="mt-2 text-sm text-red-400">{result.error}</p>
            <Link href="/login" className="mt-4 inline-block">
              <Button variant="outline">Log in</Button>
            </Link>
          </>
        ) : (
          <>
            <CardTitle className="text-emerald-400">Email verified!</CardTitle>
            <p className="mt-2 text-sm text-slate-400">
              Your gym is approved. You can manage challenges now.
            </p>
            <Link href="/admin" className="mt-4 inline-block">
              <Button>Go to admin dashboard</Button>
            </Link>
          </>
        )}
      </Card>
    </main>
  );
}
