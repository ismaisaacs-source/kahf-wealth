import React, { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@kahf/config";

export function ScreenShell({
  title,
  subtitle,
  children,
  scrollEnabled = true,
}: PropsWithChildren<{ title: string; subtitle: string; scrollEnabled?: boolean }>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={scrollEnabled}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Kahf Wealth</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: designTokens.colors.ivory,
  },
  content: {
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
  },
  header: {
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },
  eyebrow: {
    color: designTokens.colors.gold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: designTokens.colors.deepGreen,
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    color: designTokens.colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
});
