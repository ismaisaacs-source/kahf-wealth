import React from "react";
import { FeatureCard } from "../components/feature-card";
import { ScreenShell } from "../components/screen-shell";

export function NotificationsScreen() {
  return (
    <ScreenShell
      title="Notifications"
      subtitle="A quiet notification center supports zakat reminders, prayer timing nudges, estate checklist follow-ups, and watchlist alerts."
    >
      <FeatureCard
        title="Zakat reminder"
        body="Your next hawl review window opens in 12 days."
      />
      <FeatureCard
        title="Estate checklist"
        body="Guardian details and burial preferences still need review."
        accent="gold"
      />
    </ScreenShell>
  );
}
