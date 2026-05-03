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

const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInScreen({
  onCreateAccount,
}: {
  onCreateAccount: () => void;
}) {
  const { signIn, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  return (
    <ScreenShell
      title="Sign in"
      subtitle="Use your Kahf Wealth account to access your zakat dashboard and saved calculation history."
    >
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
      <PrimaryButton
        title="Sign in"
        loading={isLoading}
        onPress={handleSubmit(async (values) => signIn(values.email, values.password))}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Need an account?</Text>
        <PrimaryButton title="Create account" tone="secondary" onPress={onCreateAccount} />
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
