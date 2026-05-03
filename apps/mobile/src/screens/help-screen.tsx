import React from "react";
import { FeatureCard } from "../components/feature-card";
import { ScreenShell } from "../components/screen-shell";

export function HelpScreen() {
  return (
    <ScreenShell
      title="Help and support"
      subtitle="Support content should focus on methodology transparency, practical onboarding help, and careful escalation to human review when needed."
    >
      <FeatureCard
        title="FAQ"
        body="How zakat assumptions work, what screening labels mean, and what attorney review includes."
      />
      <FeatureCard
        title="Contact support"
        body="Secure support intake should avoid collecting unnecessary family or financial detail in free text."
        accent="gold"
      />
    </ScreenShell>
  );
}
