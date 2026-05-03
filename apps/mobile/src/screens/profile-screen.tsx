import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@kahf/config";
import { translations } from "../data/translations";
import { FeatureCard } from "../components/feature-card";
import { PrimaryButton } from "../components/primary-button";
import { ScreenShell } from "../components/screen-shell";
import { useAppStore } from "../store/use-app-store";
import { useAuth } from "../state/auth-context";

export function ProfileScreen() {
  const navigation = useNavigation();
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const setSelectedLanguage = useAppStore((state) => state.setSelectedLanguage);
  const { session, signOutUser, isLoading } = useAuth();

  return (
    <ScreenShell
      title="Profile"
      subtitle="Manage language preferences, confirm the current account, and sign out cleanly."
    >
      <FeatureCard
        title={session?.profile.fullName ?? "Kahf Wealth member"}
        body={session?.user.email ?? "Signed in account"}
      />
      <Text style={styles.label}>Language selection</Text>
      <View style={styles.row}>
        {(["en", "ar", "ur"] as const).map((language) => (
          <Pressable
            key={language}
            onPress={() => setSelectedLanguage(language)}
            style={[
              styles.chip,
              selectedLanguage === language && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedLanguage === language && styles.chipTextActive,
              ]}
            >
              {language.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.preview}>{translations[selectedLanguage].welcome}</Text>
      <Pressable
        onPress={() => navigation.navigate("TrustCenter" as never)}
        style={styles.trustButton}
      >
        <Text style={styles.trustButtonLabel}>Open Trust Center</Text>
      </Pressable>
      <PrimaryButton title="Sign out" loading={isLoading} onPress={() => void signOutUser()} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: {
    color: designTokens.colors.deepGreen,
    fontWeight: "700",
    marginBottom: designTokens.spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: designTokens.spacing.sm,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: designTokens.colors.mist,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    borderColor: designTokens.colors.deepGreen,
    backgroundColor: "#E4EEE9",
  },
  chipText: {
    color: designTokens.colors.ink,
  },
  chipTextActive: {
    color: designTokens.colors.deepGreen,
    fontWeight: "700",
  },
  preview: {
    color: designTokens.colors.ink,
    marginTop: designTokens.spacing.md,
    lineHeight: 22,
  },
  trustButton: {
    alignItems: "center",
    backgroundColor: "#FFFCF7",
    borderColor: designTokens.colors.mist,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: designTokens.spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  trustButtonLabel: {
    color: designTokens.colors.deepGreen,
    fontSize: 15,
    fontWeight: "700",
  },
});
