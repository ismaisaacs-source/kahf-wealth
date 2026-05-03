import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { designTokens } from "@kahf/config";
import type { ZakatCalculationInput } from "@kahf/domain";
import { FeatureCard } from "../components/feature-card";
import { FormInput } from "../components/form-input";
import { PrimaryButton } from "../components/primary-button";
import { ScreenShell } from "../components/screen-shell";
import { apiClient } from "../lib/api-client";
import { useAuth } from "../state/auth-context";

const moneyField = z
  .string()
  .trim()
  .refine((value) => value.length > 0, "This field is required.")
  .refine((value) => !Number.isNaN(Number(value)), "Enter a valid number.")
  .refine((value) => Number(value) >= 0, "Use zero or a positive amount.");

const zakatSchema = z.object({
  cash: moneyField,
  savings: moneyField,
  gold: moneyField,
  investments: moneyField,
  receivables: moneyField,
  liabilities: moneyField,
  nisab: moneyField,
});

type ZakatFormValues = z.infer<typeof zakatSchema>;

export function ZakatScreen() {
  const queryClient = useQueryClient();
  const { getIdToken } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ZakatFormValues>({
    defaultValues: {
      cash: "15000",
      savings: "10000",
      gold: "0",
      investments: "0",
      receivables: "0",
      liabilities: "0",
      nisab: "5500",
    },
    resolver: zodResolver(zakatSchema),
  });

  const historyQuery = useQuery({
    queryKey: ["zakat-history"],
    queryFn: async () => apiClient.getZakatHistory(await getIdToken()),
  });

  const saveMutation = useMutation({
    mutationFn: async (input: ZakatCalculationInput) =>
      apiClient.saveZakatCalculation(await getIdToken(), input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["zakat-history"] });
    },
  });

  const latest = historyQuery.data?.latest;

  return (
    <ScreenShell
      title="Zakat calculator"
      subtitle="Enter your current figures, calculate using the shared zakat engine, and save the result into API-backed history."
    >
      <Controller
        control={control}
        name="cash"
        render={({ field }) => (
          <FormInput
            label="Cash on hand"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="numeric"
            error={errors.cash?.message}
            placeholder="15000"
          />
        )}
      />
      <Controller
        control={control}
        name="savings"
        render={({ field }) => (
          <FormInput
            label="Savings balances"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="numeric"
            error={errors.savings?.message}
            placeholder="10000"
          />
        )}
      />
      <Controller
        control={control}
        name="gold"
        render={({ field }) => (
          <FormInput
            label="Gold and silver value"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="numeric"
            error={errors.gold?.message}
            placeholder="5000"
          />
        )}
      />
      <Controller
        control={control}
        name="investments"
        render={({ field }) => (
          <FormInput
            label="Stocks and halal investments"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="numeric"
            error={errors.investments?.message}
            placeholder="12000"
          />
        )}
      />
      <Controller
        control={control}
        name="receivables"
        render={({ field }) => (
          <FormInput
            label="Receivables you expect to collect"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="numeric"
            error={errors.receivables?.message}
            placeholder="2500"
          />
        )}
      />
      <Controller
        control={control}
        name="liabilities"
        render={({ field }) => (
          <FormInput
            label="Liabilities due within one year"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="numeric"
            error={errors.liabilities?.message}
            placeholder="3000"
          />
        )}
      />
      <Controller
        control={control}
        name="nisab"
        render={({ field }) => (
          <FormInput
            label="Nisab threshold"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="numeric"
            error={errors.nisab?.message}
            placeholder="5500"
          />
        )}
      />
      <Text style={styles.helper}>
        Enter only your current zakatable balances. Liabilities are limited to amounts
        genuinely due within the next lunar year.
      </Text>
      <PrimaryButton
        title="Calculate and save"
        loading={saveMutation.isPending}
        onPress={handleSubmit(async (values) => {
          const input: ZakatCalculationInput = {
            assets: [
              {
                label: "Cash on hand",
                amount: Number(values.cash),
                category: "cash",
              },
              {
                label: "Savings balances",
                amount: Number(values.savings),
                category: "savings",
              },
              {
                label: "Gold and silver",
                amount: Number(values.gold),
                category: "gold",
              },
              {
                label: "Stocks and investments",
                amount: Number(values.investments),
                category: "investments",
              },
              {
                label: "Receivables",
                amount: Number(values.receivables),
                category: "receivables",
              },
            ],
            liabilities: [
              {
                label: "Short-term liabilities",
                amount: Number(values.liabilities),
                dueWithinYear: true,
              },
            ],
            nisab: Number(values.nisab),
            currency: "USD",
          };
          await saveMutation.mutateAsync(input);
        })}
      />
      {saveMutation.error ? (
        <Text style={styles.error}>{saveMutation.error.message}</Text>
      ) : null}
      {latest ? (
        <>
          <FeatureCard
            title={latest.aboveNisab ? "Latest saved result" : "Latest saved result: below nisab"}
            body={`Saved ${new Date(latest.generatedAt).toLocaleString()}\nZakat due: ${latest.zakatDue.amount} ${latest.zakatDue.currency}\nNet zakatable assets: ${latest.netZakatableAssets.amount} ${latest.netZakatableAssets.currency}\nDeductible liabilities: ${latest.deductibleLiabilities.amount} ${latest.deductibleLiabilities.currency}`}
            accent="gold"
          />
          <View style={styles.assumptionsCard}>
            <Text style={styles.sectionTitle}>How this result was calculated</Text>
            {latest.assumptions.map((assumption) => (
              <Text key={assumption} style={styles.assumptionRow}>
                • {assumption}
              </Text>
            ))}
          </View>
        </>
      ) : null}
      <View style={styles.history}>
        <Text style={styles.historyTitle}>Recent history</Text>
        {(historyQuery.data?.history ?? []).length > 0 ? (
          (historyQuery.data?.history ?? []).slice(0, 5).map((report) => (
            <View key={report.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>
                  {new Date(report.generatedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.historyAmount}>
                  {report.zakatDue.amount} {report.zakatDue.currency}
                </Text>
              </View>
              <Text style={styles.historyMeta}>
                Net zakatable assets {report.netZakatableAssets.amount}{" "}
                {report.netZakatableAssets.currency}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.historyEmpty}>
            Your saved results will appear here after the first successful calculation.
          </Text>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  assumptionsCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  assumptionRow: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  error: {
    color: designTokens.colors.alert,
  },
  helper: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  historyAmount: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: 6,
    padding: designTokens.spacing.md,
  },
  historyDate: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  historyEmpty: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  history: {
    gap: designTokens.spacing.xs,
  },
  historyMeta: {
    color: designTokens.colors.ink,
    fontSize: 13,
  },
  historyTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 16,
    fontWeight: "700",
  },
});
