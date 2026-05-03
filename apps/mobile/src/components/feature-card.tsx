import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@kahf/config";

export function FeatureCard({
  title,
  body,
  accent = "green",
}: {
  title: string;
  body: string;
  accent?: "green" | "gold";
}) {
  return (
    <View
      style={[
        styles.card,
        accent === "gold" ? styles.cardGold : styles.cardGreen,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designTokens.radius.md,
    padding: designTokens.spacing.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
  },
  cardGreen: {
    backgroundColor: "#F1F5F2",
    borderColor: "#D5E4DD",
  },
  cardGold: {
    backgroundColor: "#FAF4E8",
    borderColor: "#E7D4AA",
  },
  title: {
    color: designTokens.colors.deepGreen,
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    color: designTokens.colors.ink,
    fontSize: 14,
    lineHeight: 21,
  },
});
