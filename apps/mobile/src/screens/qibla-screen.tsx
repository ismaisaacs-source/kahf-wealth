import React from "react";
import { Text } from "react-native";
import { FeatureCard } from "../components/feature-card";
import { ScreenShell } from "../components/screen-shell";

export function QiblaScreen() {
  return (
    <ScreenShell
      title="Qibla"
      subtitle="This screen is scaffolded for future device-sensor integration and offline-friendly last-known orientation support."
    >
      <FeatureCard
        title="Direction"
        body="Qibla compass integration should use device capabilities while handling permission denial gracefully."
      />
      <Text>Calibration and sensor confidence messaging should stay explicit and user-friendly.</Text>
    </ScreenShell>
  );
}
