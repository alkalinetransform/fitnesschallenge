import Link from "next/link";
import { PlayerRegisterForm } from "@/components/player-register-form";
import { AuthShell } from "@/components/auth-shell";
import { getSiteGym } from "@/lib/site-gym";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const gym = await getSiteGym();
  if (!gym) {
    return (
      <AuthShell title="Signup unavailable" subtitle="No gym configured">
        <p className="text-center text-sm text-slate-400">
          Contact your gym administrator. Player registration is not available yet.
        </p>
        <Link href="/login" className="mt-4 block text-center text-sm text-brand-400">
          Back to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Join the challenge" subtitle={`Squeeze the day · ${gym.name}`}>
      <PlayerRegisterForm gym={{ id: gym.id, name: gym.name, location: gym.location }} />
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-400 hover:text-brand-300">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
