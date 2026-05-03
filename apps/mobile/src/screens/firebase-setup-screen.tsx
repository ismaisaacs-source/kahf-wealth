import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@kahf/config";
import { appEnv, firebaseSetup } from "../config/env";

function FieldList({
  title,
  fields,
}: {
  title: string;
  fields: string[];
}) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {fields.map((field) => (
        <Text key={field} style={styles.listItem}>
          • {field}
        </Text>
      ))}
    </View>
  );
}

export function FirebaseSetupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Setup Required</Text>
      <Text style={styles.title}>Kahf Wealth needs valid Firebase config</Text>
      <Text style={styles.body}>
        The app is loading safely, but authentication is disabled until the
        `EXPO_PUBLIC_FIREBASE_*` values are set in your local `.env`.
      </Text>

      <FieldList title="Missing values" fields={firebaseSetup.missingFields} />
      <FieldList
        title="Values that still look invalid"
        fields={firebaseSetup.invalidFields}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current API base URL</Text>
        <Text style={styles.code}>{appEnv.apiBaseUrl}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next step</Text>
        <Text style={styles.body}>
          Add the Firebase Web app credentials to `.env`, restart Expo with
          `--clear`, and reopen the simulator.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          Linking.openURL("https://console.firebase.google.com/")
        }
        style={styles.button}
      >
        <Text style={styles.buttonText}>Open Firebase Console</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    backgroundColor: designTokens.colors.ivory,
    flex: 1,
    justifyContent: "center",
    padding: designTokens.spacing.lg,
  },
  eyebrow: {
    color: designTokens.colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: designTokens.spacing.sm,
    textTransform: "uppercase",
  },
  title: {
    color: designTokens.colors.deepGreen,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 38,
    marginBottom: designTokens.spacing.md,
  },
  body: {
    color: designTokens.colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginTop: designTokens.spacing.lg,
    width: "100%",
  },
  sectionTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: designTokens.spacing.sm,
  },
  listItem: {
    color: designTokens.colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  code: {
    backgroundColor: designTokens.colors.mist,
    borderRadius: 12,
    color: designTokens.colors.ink,
    fontSize: 14,
    overflow: "hidden",
    padding: designTokens.spacing.sm,
    width: "100%",
  },
  button: {
    backgroundColor: designTokens.colors.deepGreen,
    borderRadius: 999,
    marginTop: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
  },
  buttonText: {
    color: designTokens.colors.ivory,
    fontSize: 15,
    fontWeight: "700",
  },
});
