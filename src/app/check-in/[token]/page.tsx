import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { recordGymCheckIn } from "@/actions/check-in";
import { CheckInResult } from "@/components/check-in-result";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/check-in/${token}`)}`);
  }
  if (session.user.role !== "PLAYER") {
    redirect("/admin");
  }

  const result = await recordGymCheckIn(token);

  return <CheckInResult result={result} />;
}
