import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { MascotLogo } from "@/components/mascot";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="group min-w-0 transition hover:opacity-90">
          <MascotLogo />
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline" size="md">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
