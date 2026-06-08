import { Nav } from "@/components/nav";
import { PlayerSubNav } from "@/components/player-sub-nav";
import { PlayerExperienceLayer } from "@/components/player-experience-layer";
import { requirePlayerGym } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await requirePlayerGym();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      welcomeSeenAt: true,
      profileSetupComplete: true,
      endMetricsSentAt: true,
      resultsWrapSeenAt: true,
    },
  });

  const message = await prisma.broadcastMessage.findFirst({
    where: {
      gymId: session.user.gymId!,
      sendToInApp: true,
      dismissals: { none: { userId: session.user.id } },
      OR: [
        { isBroadcastAll: true },
        { targets: { some: { userId: session.user.id } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, body: true },
  });

  const showWelcome = !user.welcomeSeenAt;
  const showProfileSetup = !showWelcome && !user.profileSetupComplete;
  const resultsReady = Boolean(user.endMetricsSentAt && !user.resultsWrapSeenAt);

  return (
    <>
      <Nav />
      <PlayerSubNav resultsReady={resultsReady} />
      <PlayerExperienceLayer
        showWelcome={showWelcome}
        showProfileSetup={showProfileSetup}
        message={message}
      />
      <div className="mx-auto max-w-4xl overflow-x-hidden px-4 py-8 animate-fade-in">{children}</div>
    </>
  );
}
