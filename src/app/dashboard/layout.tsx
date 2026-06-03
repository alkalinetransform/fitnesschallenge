import { Nav } from "@/components/nav";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("PLAYER");
  return (
    <>
      <Nav role="PLAYER" homeHref="/dashboard" />
      <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">{children}</div>
    </>
  );
}
