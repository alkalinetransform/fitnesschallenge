import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { AdminSubNav } from "@/components/admin-sub-nav";
import { PlayerSubNav } from "@/components/player-sub-nav";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let competitionEnded = false;
  let resultsReady = false;

  if (session.user.role === "ADMIN") {
    const gym = await prisma.gym.findUnique({
      where: { adminId: session.user.id },
    });
    competitionEnded = gym?.challengeEnded ?? false;
  } else {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        endMetricsSentAt: true,
        resultsWrapSeenAt: true,
        gym: { select: { challengeEnded: true } },
      },
    });
    competitionEnded = user?.gym?.challengeEnded ?? false;
    resultsReady = Boolean(user?.endMetricsSentAt && !user.resultsWrapSeenAt);
  }

  return (
    <>
      <Nav />
      {session.user.role === "ADMIN" ? (
        <AdminSubNav competitionEnded={competitionEnded} />
      ) : (
        <PlayerSubNav resultsReady={resultsReady} />
      )}
      <div className="mx-auto max-w-4xl px-4 py-6 animate-fade-in overflow-x-hidden">{children}</div>
    </>
  );
}
