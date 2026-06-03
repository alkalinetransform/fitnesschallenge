import { resendVerificationEmailForm, logoutForm } from "@/actions/auth";
import { requireSession, getAdminGym } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default async function AdminPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const gym = await getAdminGym(session.user.id);
  const reason = params.reason ?? "email";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 animate-fade-in">
      <Card className="max-w-md">
        <CardTitle>
          {reason === "approval" ? "Awaiting approval" : "Verify your email"}
        </CardTitle>
        <p className="mt-3 text-sm text-slate-400">
          {reason === "approval"
            ? "Your gym registration is being reviewed."
            : "Check your email for a verification link. In development, the link is printed in the terminal running npm run dev."}
        </p>
        {reason === "email" && (
          <form action={resendVerificationEmailForm} className="mt-4">
            <Button type="submit" variant="outline" size="lg" className="w-full">
              Resend verification email
            </Button>
          </form>
        )}
        {gym && (
          <p className="mt-4 text-xs text-slate-500">
            Gym: {gym.name} · Status: {gym.status}
          </p>
        )}
        <form action={logoutForm} className="mt-4">
          <Button type="submit" variant="outline" size="lg" className="w-full">
            Sign out and use a different account
          </Button>
        </form>
      </Card>
    </main>
  );
}
