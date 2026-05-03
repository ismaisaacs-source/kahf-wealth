import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { designTokens } from "@kahf/config";

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  tone = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "primary" | "secondary";
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        tone === "secondary" ? styles.secondary : styles.primary,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone === "secondary" ? designTokens.colors.deepGreen : "#FFFFFF"} />
      ) : (
        <Text
          style={[
            styles.label,
            tone === "secondary" ? styles.secondaryLabel : styles.primaryLabel,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: designTokens.colors.deepGreen,
  },
  secondary: {
    backgroundColor: "#EAF2EE",
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryLabel: {
    color: "#FFFFFF",
  },
  secondaryLabel: {
    color: designTokens.colors.deepGreen,
  },
});
