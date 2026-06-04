import { Nav } from "@/components/nav";
import { AdminSubNav } from "@/components/admin-sub-nav";
import { requireApprovedAdminGym } from "@/lib/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { gym } = await requireApprovedAdminGym();

  return (
    <>
      <Nav />
      <AdminSubNav competitionEnded={gym.challengeEnded} />
      <div className="mx-auto max-w-4xl overflow-x-hidden px-4 py-8 animate-fade-in">{children}</div>
    </>
  );
}
