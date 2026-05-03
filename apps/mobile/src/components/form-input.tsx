import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { designTokens } from "@kahf/config";

export function FormInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "sentences",
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words";
  error?: string;
  placeholder?: string;
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: 14,
    borderWidth: 1,
    color: designTokens.colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: designTokens.colors.alert,
    fontSize: 12,
  },
});
