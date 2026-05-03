import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { trustCopy, designTokens } from "@kahf/config";
import { FeatureCard } from "../components/feature-card";
import { ScreenShell } from "../components/screen-shell";
import { useDashboardData } from "../hooks/use-dashboard-data";

export function HomeScreen() {
  const navigation = useNavigation();
  const { profileQuery, subscriptionQuery, zakatHistoryQuery } = useDashboardData();
  const latest = zakatHistoryQuery.data?.latest;
  const historyCount = zakatHistoryQuery.data?.history.length ?? 0;
  const latestSavedAt = latest
    ? new Date(latest.generatedAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;
  const hasError =
    profileQuery.isError || subscriptionQuery.isError || zakatHistoryQuery.isError;

  if (
    profileQuery.isLoading ||
    subscriptionQuery.isLoading ||
    zakatHistoryQuery.isLoading
  ) {
    return (
      <ScreenShell
        title="Dashboard"
        subtitle="Loading your profile, subscription, and zakat history."
      >
        <View style={styles.loading}>
          <ActivityIndicator color={designTokens.colors.deepGreen} />
        </View>
      </ScreenShell>
    );
  }

  if (hasError) {
    return (
      <ScreenShell
        title="Dashboard"
        subtitle="We couldn't refresh your dashboard data just now."
      >
        <FeatureCard
          title="Refresh needed"
          body="Your profile, subscription, or zakat history could not be loaded. Try again and we will reconnect to the API."
          accent="gold"
        />
        <Pressable
          onPress={() => {
            void profileQuery.refetch();
            void subscriptionQuery.refetch();
            void zakatHistoryQuery.refetch();
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryLabel}>Retry dashboard</Text>
        </Pressable>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title={`Assalamu alaikum, ${profileQuery.data?.fullName ?? "member"}`}
      subtitle="A clean dashboard for your current plan, most recent zakat result, and saved financial progress."
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Today&apos;s focus</Text>
        <Text style={styles.heroTitle}>
          {latest
            ? `${latest.zakatDue.amount} ${latest.zakatDue.currency} due from your latest saved review`
            : "Complete your first zakat review and save it to your history"}
        </Text>
        <Text style={styles.heroBody}>
          {latest
            ? `Last saved ${latestSavedAt}. Your dashboard is tracking ${historyCount} saved calculation${historyCount === 1 ? "" : "s"} so far.`
            : "Start with the Zakat tab, save a result, and your dashboard will keep the latest summary ready here."}
        </Text>
        <View style={styles.heroMetrics}>
          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>Plan</Text>
            <Text style={styles.metricValue}>
              {subscriptionQuery.data?.plan?.toUpperCase() ?? "FREE"}
            </Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>Saved</Text>
            <Text style={styles.metricValue}>{historyCount}</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => navigation.navigate("Zakat" as never)}
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionLabel}>
              {latest ? "Update zakat review" : "Start zakat review"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Profile" as never)}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionLabel}>Review profile</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.sectionEyebrow}>Snapshot</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Current plan</Text>
          <Text style={styles.summaryValue}>
            {subscriptionQuery.data?.plan?.toUpperCase() ?? "FREE"}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saved reports</Text>
          <Text style={styles.summaryValue}>{historyCount}</Text>
        </View>
      </View>
      <FeatureCard
        title="Account snapshot"
        body={`Language: ${profileQuery.data?.language?.toUpperCase() ?? "EN"}\nPlan benefits are ready for ${subscriptionQuery.data?.plan ?? "free"} access.\nPremium unlocks deeper reports, richer reminders, and estate exports later in the roadmap.`}
        accent="gold"
      />
      <FeatureCard
        title={latest ? "Latest zakat result" : "No zakat history yet"}
        body={
          latest
            ? `Saved ${latestSavedAt}\nZakat due: ${latest.zakatDue.amount} ${latest.zakatDue.currency}\nNet zakatable assets: ${latest.netZakatableAssets.amount} ${latest.netZakatableAssets.currency}\nStatus: ${latest.aboveNisab ? "Above nisab" : "Below nisab"}`
            : "Visit the Zakat tab to calculate and save your first result."
        }
      />
      <View style={styles.readinessCard}>
        <Text style={styles.sectionEyebrow}>Guidance</Text>
        <Text style={styles.readinessTitle}>What to do next</Text>
        <Text style={styles.readinessBody}>
          {latest
            ? "Review the Zakat tab if your balances have changed, then save a fresh calculation so your dashboard stays current."
            : "Enter your current cash, savings, gold, investments, receivables, and short-term liabilities to produce the first saved result."}
        </Text>
        <Text style={styles.readinessHint}>
          Keep the numbers current and treat the result as planning support reviewed against your preferred scholarly guidance.
        </Text>
      </View>
      <View style={styles.historyCard}>
        <Text style={styles.sectionEyebrow}>History</Text>
        <Text style={styles.historyTitle}>Recent zakat history</Text>
        {historyCount > 0 ? (
          zakatHistoryQuery.data?.history.slice(0, 3).map((report) => (
            <View key={report.id} style={styles.historyRow}>
              <View style={styles.historyCopy}>
                <Text style={styles.historyDate}>
                  {new Date(report.generatedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.historyMeta}>
                  Net assets {report.netZakatableAssets.amount} {report.netZakatableAssets.currency}
                </Text>
              </View>
              <Text style={styles.historyAmount}>
                {report.zakatDue.amount} {report.zakatDue.currency}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>
            Your saved zakat history will appear here after the first calculation.
          </Text>
        )}
      </View>
      <Text style={styles.disclaimer}>{trustCopy.zakatDisclaimer}</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: designTokens.spacing.sm,
  },
  disclaimer: {
    color: designTokens.colors.ink,
    lineHeight: 22,
  },
  emptyState: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  heroBody: {
    color: designTokens.colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: "#F8F2E6",
    borderColor: "#E5D5B0",
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.lg,
  },
  heroEyebrow: {
    color: designTokens.colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  heroMetrics: {
    flexDirection: "row",
    gap: designTokens.spacing.sm,
  },
  heroTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
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
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  historyCopy: {
    flex: 1,
    gap: 2,
  },
  historyDate: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  historyMeta: {
    color: designTokens.colors.ink,
    fontSize: 13,
  },
  historyRow: {
    alignItems: "center",
    borderTopColor: "#ECE7DB",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: designTokens.spacing.md,
    paddingTop: designTokens.spacing.sm,
  },
  historyTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 18,
    fontWeight: "700",
  },
  loading: {
    alignItems: "center",
    paddingVertical: designTokens.spacing.xl,
  },
  metricLabel: {
    color: "#52615B",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  metricPill: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "#E9DDC2",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metricValue: {
    color: designTokens.colors.deepGreen,
    fontSize: 12,
    fontWeight: "700",
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: designTokens.colors.deepGreen,
    borderRadius: 16,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryActionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  readinessBody: {
    color: designTokens.colors.ink,
    fontSize: 14,
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
  readinessHint: {
    color: "#5B6964",
    fontSize: 13,
    lineHeight: 19,
  },
  readinessTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 18,
    fontWeight: "700",
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: designTokens.colors.deepGreen,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  retryLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionEyebrow: {
    color: designTokens.colors.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: -6,
    textTransform: "uppercase",
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  secondaryActionLabel: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#FFFCF7",
    borderColor: "#E9E1D2",
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: designTokens.spacing.md,
  },
  summaryLabel: {
    color: designTokens.colors.ink,
    fontSize: 13,
    textTransform: "uppercase",
  },
  summaryRow: {
    flexDirection: "row",
    gap: designTokens.spacing.md,
  },
  summaryValue: {
    color: designTokens.colors.deepGreen,
    fontSize: 22,
    fontWeight: "700",
  },
});
