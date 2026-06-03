import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function FrozenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center animate-scale-in">
        <CardTitle>Account deactivated</CardTitle>
        <p className="mt-3 text-sm text-slate-400">
          Your gym admin has frozen your account. Contact them if you think this is a mistake.
        </p>
        <Link href="/login" className="mt-4 inline-block">
          <Button variant="outline">Back to login</Button>
        </Link>
      </Card>
    </main>
  );
}
