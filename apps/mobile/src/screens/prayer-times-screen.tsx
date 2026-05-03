import React from "react";
import { FeatureCard } from "../components/feature-card";
import { ScreenShell } from "../components/screen-shell";

export function PrayerTimesScreen() {
  return (
    <ScreenShell
      title="Prayer times"
      subtitle="Support features stay lightweight and respectful, giving users a calm daily utility layer around the core financial planning product."
    >
      <FeatureCard title="Fajr" body="05:01" />
      <FeatureCard title="Dhuhr" body="12:11" />
      <FeatureCard title="Asr" body="15:34" />
      <FeatureCard title="Maghrib" body="18:02" />
      <FeatureCard title="Isha" body="19:14" />
    </ScreenShell>
  );
}
