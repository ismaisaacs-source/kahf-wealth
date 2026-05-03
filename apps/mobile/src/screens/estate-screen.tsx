import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@kahf/config";
import type { EstateFoundationInput } from "@kahf/domain";
import { FormInput } from "../components/form-input";
import { PrimaryButton } from "../components/primary-button";
import { ScreenShell } from "../components/screen-shell";
import { apiClient } from "../lib/api-client";
import { useAuth } from "../state/auth-context";

const MARITAL_STATUSES = ["single", "married", "divorced", "widowed"] as const;

export function EstateScreen() {
  const queryClient = useQueryClient();
  const { getIdToken } = useAuth();
  const [draft, setDraft] = useState<EstateFoundationInput>({
    maritalStatus: "single",
    jurisdiction: "",
    spouseName: "",
    childrenCount: 0,
    executorName: "",
    guardianName: "",
    assetEstimate: 0,
    liabilityEstimate: 0,
    burialPreferences: "",
    bequestNotes: "",
  });

  const planQuery = useQuery({
    queryKey: ["estate-plan"],
    queryFn: async () => apiClient.getEstatePlan(await getIdToken()),
  });

  const readinessQuery = useQuery({
    queryKey: ["estate-readiness"],
    queryFn: async () => apiClient.getEstateReadiness(await getIdToken()),
  });

  useEffect(() => {
    if (!planQuery.data) {
      return;
    }

    const spouse = planQuery.data.familyMembers.find((member) => member.relationship === "spouse");
    const childrenCount = planQuery.data.familyMembers.filter(
      (member) => member.relationship === "child",
    ).length;

    setDraft({
      maritalStatus: planQuery.data.maritalStatus,
      jurisdiction: planQuery.data.jurisdiction ?? "",
      spouseName: spouse?.fullName ?? "",
      childrenCount,
      executorName: planQuery.data.executors[0]?.fullName ?? "",
      guardianName: planQuery.data.guardians[0]?.fullName ?? "",
      assetEstimate: planQuery.data.assets[0]?.value.amount ?? 0,
      liabilityEstimate: planQuery.data.liabilities[0]?.amount.amount ?? 0,
      burialPreferences: planQuery.data.burialPreferences ?? "",
      bequestNotes: planQuery.data.bequestNotes ?? "",
    });
  }, [planQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (input: EstateFoundationInput) =>
      apiClient.saveEstatePlan(await getIdToken(), input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["estate-plan"] });
      await queryClient.invalidateQueries({ queryKey: ["estate-readiness"] });
    },
  });

  return (
    <ScreenShell
      title="Islamic estate planning"
      subtitle="Capture the first lawyer-ready estate intake foundation without reproducing the downstream drafting engine."
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Attorney-ready intake</Text>
        <Text style={styles.heroTitle}>Prepare the core estate facts before formal drafting</Text>
        <Text style={styles.heroBody}>
          Kahf Wealth helps collect family, executor, guardian, and balance-sheet basics so
          attorney review can start from a clearer intake.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Household basics</Text>
        <View style={styles.chipRow}>
          {MARITAL_STATUSES.map((status) => (
            <Pressable
              key={status}
              onPress={() => setDraft((current) => ({ ...current, maritalStatus: status }))}
              style={[
                styles.chip,
                draft.maritalStatus === status && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  draft.maritalStatus === status && styles.chipTextActive,
                ]}
              >
                {status}
              </Text>
            </Pressable>
          ))}
        </View>
        <FormInput
          label="Jurisdiction"
          value={draft.jurisdiction}
          onChangeText={(value) => setDraft((current) => ({ ...current, jurisdiction: value }))}
          placeholder="South Africa"
        />
        <FormInput
          label="Spouse name"
          value={draft.spouseName}
          onChangeText={(value) => setDraft((current) => ({ ...current, spouseName: value }))}
          placeholder="Zaynab"
        />
        <FormInput
          label="Number of children"
          value={String(draft.childrenCount)}
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, childrenCount: toWholeNumber(value) }))
          }
          keyboardType="numeric"
          placeholder="2"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decision-makers</Text>
        <FormInput
          label="Executor"
          value={draft.executorName}
          onChangeText={(value) => setDraft((current) => ({ ...current, executorName: value }))}
          placeholder="Abdullah Trustee"
        />
        <FormInput
          label="Guardian for minors"
          value={draft.guardianName}
          onChangeText={(value) => setDraft((current) => ({ ...current, guardianName: value }))}
          placeholder="Khadijah Guardian"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated estate balances</Text>
        <FormInput
          label="Estimated total assets"
          value={String(draft.assetEstimate)}
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, assetEstimate: toMoneyNumber(value) }))
          }
          keyboardType="numeric"
          placeholder="250000"
        />
        <FormInput
          label="Estimated total liabilities"
          value={String(draft.liabilityEstimate)}
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, liabilityEstimate: toMoneyNumber(value) }))
          }
          keyboardType="numeric"
          placeholder="40000"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences and notes</Text>
        <FormInput
          label="Burial preferences"
          value={draft.burialPreferences ?? ""}
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, burialPreferences: value }))
          }
          placeholder="Islamic burial as soon as reasonably possible."
        />
        <FormInput
          label="Bequest notes"
          value={draft.bequestNotes ?? ""}
          onChangeText={(value) => setDraft((current) => ({ ...current, bequestNotes: value }))}
          placeholder="Charitable wishes and personal bequest notes"
        />
      </View>

      <PrimaryButton
        title="Save estate foundation"
        loading={saveMutation.isPending}
        onPress={() => void saveMutation.mutateAsync(draft)}
      />

      {saveMutation.error ? (
        <Text style={styles.errorText}>
          {saveMutation.error instanceof Error
            ? saveMutation.error.message
            : "Estate foundation could not be saved."}
        </Text>
      ) : null}

      {readinessQuery.data ? (
        <View style={styles.readinessCard}>
          <Text style={styles.sectionTitle}>
            Readiness score: {readinessQuery.data.readinessScore}
          </Text>
          <Text style={styles.summaryText}>{readinessQuery.data.summaryText}</Text>
          <Text style={styles.subheading}>Likely heirs</Text>
          {readinessQuery.data.likelyHeirs.length > 0 ? (
            readinessQuery.data.likelyHeirs.map((heir) => (
              <Text key={heir.relationship} style={styles.listRow}>
                • {heir.relationship}: {heir.count}
              </Text>
            ))
          ) : (
            <Text style={styles.listRow}>• No heir groups identified yet.</Text>
          )}
          <Text style={styles.subheading}>Missing items</Text>
          {readinessQuery.data.missingItems.length > 0 ? (
            readinessQuery.data.missingItems.map((item) => (
              <Text key={item} style={styles.listRow}>
                • {item}
              </Text>
            ))
          ) : (
            <Text style={styles.listRow}>• No major readiness gaps detected.</Text>
          )}
        </View>
      ) : null}
    </ScreenShell>
  );
}

function toMoneyNumber(value: string) {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const next = Number(sanitized);
  return Number.isFinite(next) ? next : 0;
}

function toWholeNumber(value: string) {
  const sanitized = value.replace(/[^0-9]/g, "");
  const next = Number(sanitized);
  return Number.isFinite(next) ? next : 0;
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: "#E4EEE9",
    borderColor: designTokens.colors.deepGreen,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.spacing.sm,
  },
  chipText: {
    color: designTokens.colors.ink,
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: designTokens.colors.deepGreen,
    fontWeight: "700",
  },
  errorText: {
    color: designTokens.colors.alert,
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
  listRow: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  readinessCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  section: {
    gap: designTokens.spacing.sm,
  },
  sectionTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 18,
    fontWeight: "700",
  },
  subheading: {
    color: designTokens.colors.deepGreen,
    fontSize: 15,
    fontWeight: "700",
    marginTop: designTokens.spacing.sm,
  },
  summaryText: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
});
