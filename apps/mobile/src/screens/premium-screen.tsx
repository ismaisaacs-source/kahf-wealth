import React from "react";
import { FeatureCard } from "../components/feature-card";
import { ScreenShell } from "../components/screen-shell";

export function PremiumScreen() {
  return (
    <ScreenShell
      title="Premium"
      subtitle="Premium logic is centralized in shared config so feature access, upsells, and future paid services remain consistent across the stack."
    >
      <FeatureCard
        title="Included"
        body="Advanced zakat reports, expanded screening, estate exports, document vault, and richer reminders."
      />
      <FeatureCard
        title="Optional services"
        body="Estate planning pack and attorney-reviewed Islamic will handoff."
        accent="gold"
      />
    </ScreenShell>
  );
}
