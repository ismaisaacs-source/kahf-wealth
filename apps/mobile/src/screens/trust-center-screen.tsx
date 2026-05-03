import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@kahf/config";
import { FeatureCard } from "../components/feature-card";
import { ScreenShell } from "../components/screen-shell";
import { apiClient } from "../lib/api-client";
import { useAuth } from "../state/auth-context";

export function TrustCenterScreen() {
  const { getIdToken } = useAuth();
  const methodologyQuery = useQuery({
    queryKey: ["methodology"],
    queryFn: async () => apiClient.getMethodology(await getIdToken()),
  });

  return (
    <ScreenShell
      title="Trust Center"
      subtitle="Methodology, scholar notes, disclaimers, and dated versioning should stay visible wherever financial or estate guidance is provided."
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Transparency</Text>
        <Text style={styles.heroTitle}>
          Review the methodology before you rely on any financial guidance
        </Text>
        <Text style={styles.heroBody}>
          {methodologyQuery.data?.disclaimers.screeningDisclaimer ??
            "Classification results are provided for educational and planning support."}
        </Text>
      </View>

      {methodologyQuery.isLoading ? (
        <Text style={styles.helper}>Loading methodology details...</Text>
      ) : methodologyQuery.isError ? (
        <Text style={styles.errorText}>
          {methodologyQuery.error instanceof Error
            ? methodologyQuery.error.message
            : "Methodology could not be loaded."}
        </Text>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Methodology versions</Text>
            {methodologyQuery.data?.versions.map((version) => (
              <FeatureCard
                key={version.id}
                title={`${version.kind} methodology ${version.version}`}
                body={`${version.summary}\nEffective ${version.effectiveDate}.\n${version.disclaimer}`}
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advisory notes</Text>
            {methodologyQuery.data?.notes.map((note) => (
              <View key={`${note.versionId}-${note.title}`} style={styles.noteCard}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteBody}>{note.content}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disclaimers</Text>
            <View style={styles.noteCard}>
              <Text style={styles.noteBody}>
                {methodologyQuery.data?.disclaimers.zakatDisclaimer}
              </Text>
            </View>
            <View style={styles.noteCard}>
              <Text style={styles.noteBody}>
                {methodologyQuery.data?.disclaimers.estateDisclaimer}
              </Text>
            </View>
          </View>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: designTokens.colors.alert,
    lineHeight: 21,
  },
  helper: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  heroBody: {
    color: designTokens.colors.ink,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: "#F7F1E5",
    borderColor: "#E3D2AC",
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.lg,
  },
  heroEyebrow: {
    color: designTokens.colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  noteBody: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  noteTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    gap: designTokens.spacing.sm,
  },
  sectionTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 18,
    fontWeight: "700",
  },
});
