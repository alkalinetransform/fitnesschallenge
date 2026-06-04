"use client";

import { useState } from "react";
import { WelcomeSplash } from "@/components/welcome-splash";
import { ProfileSetupWizard } from "@/components/profile-setup-wizard";
import { PlayerMessagePopup } from "@/components/player-message-popup";

export function PlayerExperienceLayer({
  showWelcome,
  showProfileSetup,
  message,
}: {
  showWelcome: boolean;
  showProfileSetup: boolean;
  message: { id: string; body: string } | null;
}) {
  const [welcomeDone, setWelcomeDone] = useState(!showWelcome);

  return (
    <>
      {showWelcome && !welcomeDone && (
        <WelcomeSplash show onDone={() => setWelcomeDone(true)} />
      )}
      {welcomeDone && showProfileSetup && <ProfileSetupWizard />}
      {welcomeDone && !showProfileSetup && message && (
        <PlayerMessagePopup messageId={message.id} body={message.body} />
      )}
    </>
  );
}
