import { Nav } from "@/components/nav";
import { AdminSubNav } from "@/components/admin-sub-nav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav role="ADMIN" homeHref="/admin" />
      <AdminSubNav />
      <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">{children}</div>
    </>
  );
}
