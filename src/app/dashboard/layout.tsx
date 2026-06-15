import { Nav } from "@/components/nav";
import { PlayerSubNav } from "@/components/player-sub-nav";
import { PlayerExperienceLayer } from "@/components/player-experience-layer";
import { requirePlayerGym } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getMaxSelectableWeek } from "@/lib/weeks";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, gym } = await requirePlayerGym();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      createdAt: true,
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
      createdAt: { gt: user.createdAt },
      dismissals: { none: { userId: session.user.id } },
      OR: [
        { isBroadcastAll: true },
        { targets: { some: { userId: session.user.id } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, body: true },
  });

  const calendarWeek = gym.challengeEnded
    ? gym.activeWeek
    : getMaxSelectableWeek(gym.seasonStartDate);

  const showWelcome = !user.welcomeSeenAt;
  const showProfileSetup = !user.profileSetupComplete;
  const resultsReady = Boolean(user.endMetricsSentAt && !user.resultsWrapSeenAt);

  return (
    <>
      <Nav />
      <PlayerSubNav resultsReady={resultsReady} calendarWeek={calendarWeek} />
      <PlayerExperienceLayer
        showWelcome={showWelcome}
        showProfileSetup={showProfileSetup}
        message={message}
      />
      <div className="mx-auto max-w-4xl overflow-x-hidden px-4 py-8 animate-fade-in">{children}</div>
    </>
  );
}
