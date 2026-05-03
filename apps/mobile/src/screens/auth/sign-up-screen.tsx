import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { designTokens } from "@kahf/config";
import { FormInput } from "../../components/form-input";
import { PrimaryButton } from "../../components/primary-button";
import { ScreenShell } from "../../components/screen-shell";
import { useAuth } from "../../state/auth-context";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpScreen({
  onBackToSignIn,
}: {
  onBackToSignIn: () => void;
}) {
  const { signUp, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signUpSchema),
  });

  return (
    <ScreenShell
      title="Create account"
      subtitle="A simple email and password account is enough to save zakat calculations and restore them across sessions."
    >
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FormInput
            label="Full name"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <FormInput
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <FormInput
            label="Password"
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormInput
            label="Confirm password"
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword?.message}
          />
        )}
      />
      <PrimaryButton
        title="Create account"
        loading={isLoading}
        onPress={handleSubmit(async (values) =>
          signUp(values.name, values.email, values.password),
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already registered?</Text>
        <PrimaryButton title="Back to sign in" tone="secondary" onPress={onBackToSignIn} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: designTokens.spacing.sm,
    marginTop: designTokens.spacing.sm,
  },
  footerText: {
    color: designTokens.colors.ink,
  },
});
