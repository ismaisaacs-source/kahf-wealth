import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Linking, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { trustCopy, designTokens } from "@kahf/config";
import type {
  ScreeningActivityEvent,
  ScreeningAssetDetail,
  ScreeningPortfolioHolding,
} from "@kahf/domain";
import { ScreenShell } from "../components/screen-shell";
import { appEnv } from "../config/env";
import { apiClient } from "../lib/api-client";
import { useAuth } from "../state/auth-context";

const QUICK_LOOKUPS = ["SPUS", "HLAL", "AAPL", "TSLA", "BAC"];

export function ScreeningScreen() {
  const queryClient = useQueryClient();
  const { getIdToken } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<string>("SPUS");
  const [units, setUnits] = useState("25");
  const [isSharingReport, setIsSharingReport] = useState(false);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);

  const searchQuery = useQuery({
    queryKey: ["screening-search", query],
    queryFn: async () => apiClient.searchScreeningAssets(await getIdToken(), query),
  });

  const watchlistQuery = useQuery({
    queryKey: ["screening-watchlist"],
    queryFn: async () => apiClient.getScreeningWatchlist(await getIdToken()),
  });

  const portfolioQuery = useQuery({
    queryKey: ["screening-portfolio"],
    queryFn: async () => apiClient.getScreeningPortfolio(await getIdToken()),
  });

  const portfolioReportQuery = useQuery({
    queryKey: ["screening-portfolio-report"],
    queryFn: async () => apiClient.getScreeningPortfolioReport(await getIdToken()),
  });

  const activityQuery = useQuery({
    queryKey: ["screening-activity"],
    queryFn: async () => apiClient.getScreeningActivity(await getIdToken()),
  });

  const selectedAssetQuery = useQuery({
    queryKey: ["screening-asset", selectedTicker],
    queryFn: async () => apiClient.getScreeningAsset(await getIdToken(), selectedTicker),
    enabled: Boolean(selectedTicker),
  });

  const watchlistMutation = useMutation({
    mutationFn: async (asset: ScreeningAssetDetail) => {
      const idToken = await getIdToken();
      const exists = watchlistQuery.data?.items.some((item) => item.ticker === asset.ticker);
      return exists
        ? apiClient.removeFromScreeningWatchlist(idToken, asset.ticker)
        : apiClient.addToScreeningWatchlist(idToken, asset.ticker);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["screening-watchlist"] });
    },
  });

  const portfolioMutation = useMutation({
    mutationFn: async (asset: ScreeningAssetDetail) => {
      const parsedUnits = Number(units);
      if (!Number.isFinite(parsedUnits) || parsedUnits <= 0) {
        throw new Error("Enter portfolio units greater than zero.");
      }

      return apiClient.saveScreeningPortfolioHolding(
        await getIdToken(),
        asset.ticker,
        parsedUnits,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["screening-portfolio"] });
      await queryClient.invalidateQueries({ queryKey: ["screening-portfolio-report"] });
      await queryClient.invalidateQueries({ queryKey: ["screening-activity"] });
    },
  });

  const removePortfolioMutation = useMutation({
    mutationFn: async (ticker: string) =>
      apiClient.removeScreeningPortfolioHolding(await getIdToken(), ticker),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["screening-portfolio"] });
      await queryClient.invalidateQueries({ queryKey: ["screening-portfolio-report"] });
      await queryClient.invalidateQueries({ queryKey: ["screening-activity"] });
    },
  });

  const pdfPackMutation = useMutation({
    mutationFn: async () => apiClient.generateScreeningPortfolioPdfPack(await getIdToken()),
  });

  const selectedAsset = selectedAssetQuery.data ?? searchQuery.data?.results[0];
  const watchlistTickers = useMemo(
    () => new Set((watchlistQuery.data?.items ?? []).map((item) => item.ticker)),
    [watchlistQuery.data?.items],
  );
  const portfolioHoldings = portfolioQuery.data?.holdings ?? [];
  const portfolioHolding = portfolioHoldings.find((holding) => holding.ticker === selectedAsset?.ticker);
  const portfolioTickers = useMemo(
    () => new Set(portfolioHoldings.map((holding) => holding.ticker)),
    [portfolioHoldings],
  );
  const purificationHoldings = portfolioHoldings.filter(
    (holding) => (holding.purificationRatio ?? 0) > 0,
  );
  const highestPurificationHolding = purificationHoldings
    .slice()
    .sort((left, right) => (right.purificationRatio ?? 0) - (left.purificationRatio ?? 0))[0];
  const isSaved = selectedAsset ? watchlistTickers.has(selectedAsset.ticker) : false;
  const isInPortfolio = selectedAsset ? portfolioTickers.has(selectedAsset.ticker) : false;

  useEffect(() => {
    if (!selectedAsset?.ticker) {
      return;
    }

    const existingHolding = portfolioHoldings.find((holding) => holding.ticker === selectedAsset.ticker);
    if (existingHolding) {
      setUnits(String(existingHolding.units));
      return;
    }

    setUnits("25");
  }, [portfolioHoldings, selectedAsset?.ticker]);

  async function handleShareReport() {
    if (!portfolioReportQuery.data) {
      return;
    }

    setIsSharingReport(true);
    try {
      await Share.share({
        title: portfolioReportQuery.data.fileName,
        message: portfolioReportQuery.data.shareBody,
      });
    } finally {
      setIsSharingReport(false);
    }
  }

  async function handleOpenPdfPack() {
    setIsOpeningPdf(true);
    try {
      const pack = await pdfPackMutation.mutateAsync();
      const origin = apiBaseOrigin();
      await Linking.openURL(`${origin}${pack.downloadPath}`);
    } finally {
      setIsOpeningPdf(false);
    }
  }

  return (
    <ScreenShell
      title="Halal investment screening"
      subtitle="Search a stock or ETF, review the classification with methodology context, and keep a trust-first watchlist and portfolio pulse."
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Methodology</Text>
        <Text style={styles.heroTitle}>Explainable screening with visible limits</Text>
        <Text style={styles.heroBody}>
          {searchQuery.data?.disclaimer ?? trustCopy.screeningDisclaimer}
        </Text>
      </View>

      <View style={styles.summaryStrip}>
        <SummaryPill label="Watchlist" value={String(watchlistQuery.data?.items.length ?? 0)} />
        <SummaryPill label="Portfolio" value={String(portfolioQuery.data?.summary.positions ?? 0)} />
        <SummaryPill
          label="Purification"
          value={toPercent(portfolioQuery.data?.summary.estimatedPurificationRatio ?? 0)}
        />
        <SummaryPill
          label="Methodology"
          value={selectedAsset?.methodology.version ?? "2026.04"}
        />
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.sectionTitle}>Search stocks and ETFs</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ticker or issuer name"
          autoCapitalize="characters"
          style={styles.searchInput}
        />
        <View style={styles.quickLookupRow}>
          {QUICK_LOOKUPS.map((ticker) => (
            <Pressable
              key={ticker}
              onPress={() => {
                setQuery(ticker);
                setSelectedTicker(ticker);
              }}
              style={styles.quickLookupChip}
            >
              <Text style={styles.quickLookupLabel}>{ticker}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.resultsCard}>
        <Text style={styles.sectionTitle}>Search results</Text>
        {searchQuery.isLoading ? (
          <Text style={styles.helper}>Loading search results...</Text>
        ) : searchQuery.isError ? (
          <Text style={styles.errorText}>
            {searchQuery.error instanceof Error
              ? searchQuery.error.message
              : "Screening results could not be loaded."}
          </Text>
        ) : (searchQuery.data?.results ?? []).length > 0 ? (
          (searchQuery.data?.results ?? []).map((asset) => (
            <Pressable
              key={asset.ticker}
              onPress={() => setSelectedTicker(asset.ticker)}
              style={[
                styles.resultRow,
                selectedAsset?.ticker === asset.ticker && styles.resultRowActive,
              ]}
            >
              <View style={styles.resultCopy}>
                <Text style={styles.resultTicker}>{asset.asset.ticker}</Text>
                <Text style={styles.resultName}>{asset.asset.name}</Text>
                <Text style={styles.resultMeta}>
                  {asset.asset.kind.toUpperCase()} · {asset.asset.exchange}
                </Text>
              </View>
              <View style={styles.resultBadges}>
                {watchlistTickers.has(asset.ticker) ? (
                  <View style={styles.miniChip}>
                    <Text style={styles.miniChipLabel}>Saved</Text>
                  </View>
                ) : null}
                {portfolioTickers.has(asset.ticker) ? (
                  <View style={styles.miniChip}>
                    <Text style={styles.miniChipLabel}>Held</Text>
                  </View>
                ) : null}
                <View style={[styles.badge, badgeStyle(asset.classification)]}>
                  <Text style={styles.badgeLabel}>{asset.classification}</Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={styles.helper}>
            No matching assets were found under the current mocked universe.
          </Text>
        )}
      </View>

      {selectedAsset ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.resultCopy}>
              <Text style={styles.detailTicker}>{selectedAsset.asset.ticker}</Text>
              <Text style={styles.detailName}>{selectedAsset.asset.name}</Text>
              <Text style={styles.detailDescription}>{selectedAsset.asset.description}</Text>
            </View>
            <View style={[styles.badge, badgeStyle(selectedAsset.classification)]}>
              <Text style={styles.badgeLabel}>{selectedAsset.classification}</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Current tracking state</Text>
            <Text style={styles.statusBody}>
              {isSaved || isInPortfolio
                ? `${selectedAsset.asset.ticker} is ${isSaved ? "saved in watchlist" : "not saved"}, ${
                    isInPortfolio
                      ? `and tracked in portfolio at ${portfolioHolding?.units ?? 0} units.`
                      : "and not yet tracked in your portfolio."
                  }`
                : "This asset is not yet saved to your watchlist or portfolio."}
            </Text>
          </View>

          {portfolioHolding ? (
            <View style={styles.analyticsCard}>
              <Text style={styles.statusTitle}>Held position detail</Text>
              <Text style={styles.statusBody}>
                You currently track {portfolioHolding.units} units of {portfolioHolding.ticker}.
              </Text>
              <Text style={styles.statusBody}>
                Classification: {portfolioHolding.classification}
              </Text>
              <Text style={styles.statusBody}>
                {portfolioHolding.purificationRatio
                  ? `Plan for up to ${toPercent(portfolioHolding.purificationRatio)} purification on this holding.`
                  : "No explicit purification ratio is currently surfaced for this holding."}
              </Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Why this result</Text>
          {selectedAsset.reasons.map((reason) => (
            <Text key={reason} style={styles.reasonRow}>
              • {reason}
            </Text>
          ))}

          <View style={styles.metricsGrid}>
            <Metric label="Debt/assets" value={toPercent(selectedAsset.metrics.debtToAssetsRatio)} />
            <Metric label="Impure income" value={toPercent(selectedAsset.metrics.impureIncomeRatio)} />
            <Metric label="Cash/assets" value={toPercent(selectedAsset.metrics.cashToAssetsRatio)} />
          </View>

          <Text style={styles.methodologyText}>
            Methodology {selectedAsset.methodology.version} · Checked{" "}
            {new Date(selectedAsset.checkedAt).toLocaleDateString()} · Data freshness:{" "}
            {selectedAsset.asset.dataFreshness}
          </Text>

          {selectedAsset.purificationRatio ? (
            <Text style={styles.purification}>
              Potential purification ratio: {toPercent(selectedAsset.purificationRatio)}
            </Text>
          ) : null}

          <View style={styles.actionCluster}>
            <Pressable
              onPress={() => void watchlistMutation.mutateAsync(selectedAsset)}
              style={[
                styles.actionButton,
                watchlistMutation.isPending && styles.actionButtonDisabled,
              ]}
              disabled={watchlistMutation.isPending}
            >
              <Text style={styles.actionButtonLabel}>
                {watchlistMutation.isPending
                  ? "Updating watchlist..."
                  : isSaved
                  ? "Remove from watchlist"
                  : "Save to watchlist"}
              </Text>
            </Pressable>
            <Text style={styles.watchlistHint}>
              {isSaved
                ? "This asset is already saved in your personal watchlist."
                : "Save this asset if you want to revisit its current classification quickly."}
            </Text>
          </View>

          <View style={styles.portfolioComposer}>
            <Text style={styles.sectionTitle}>Portfolio tracking</Text>
            <TextInput
              value={units}
              onChangeText={setUnits}
              keyboardType="numeric"
              placeholder="Units"
              style={styles.searchInput}
            />
            <View style={styles.portfolioActions}>
              <Pressable
                onPress={() => void portfolioMutation.mutateAsync(selectedAsset)}
                style={[
                  styles.actionButton,
                  styles.flexButton,
                  portfolioMutation.isPending && styles.actionButtonDisabled,
                ]}
                disabled={portfolioMutation.isPending}
              >
                <Text style={styles.actionButtonLabel}>
                  {portfolioMutation.isPending
                    ? "Updating portfolio..."
                    : isInPortfolio
                    ? "Update position"
                    : "Add to portfolio"}
                </Text>
              </Pressable>
              {isInPortfolio ? (
                <Pressable
                  onPress={() => void removePortfolioMutation.mutateAsync(selectedAsset.ticker)}
                  style={[
                    styles.secondaryButton,
                    removePortfolioMutation.isPending && styles.actionButtonDisabled,
                  ]}
                  disabled={removePortfolioMutation.isPending}
                >
                  <Text style={styles.secondaryButtonLabel}>
                    {removePortfolioMutation.isPending ? "Removing..." : "Remove"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {portfolioMutation.error ? (
              <Text style={styles.errorText}>
                {portfolioMutation.error instanceof Error
                  ? portfolioMutation.error.message
                  : "Portfolio update failed."}
              </Text>
            ) : null}
            {removePortfolioMutation.error ? (
              <Text style={styles.errorText}>
                {removePortfolioMutation.error instanceof Error
                  ? removePortfolioMutation.error.message
                  : "Portfolio removal failed."}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.watchlistCard}>
        <Text style={styles.sectionTitle}>Portfolio snapshot</Text>
        {portfolioQuery.isLoading ? (
          <Text style={styles.helper}>Loading portfolio positions...</Text>
        ) : portfolioQuery.isError ? (
          <Text style={styles.errorText}>
            {portfolioQuery.error instanceof Error
              ? portfolioQuery.error.message
              : "Portfolio could not be loaded."}
          </Text>
        ) : (
          <>
            <View style={styles.metricsGrid}>
              <Metric label="Positions" value={String(portfolioQuery.data?.summary.positions ?? 0)} />
              <Metric label="Units" value={String(portfolioQuery.data?.summary.totalUnits ?? 0)} />
              <Metric label="Compliant" value={String(portfolioQuery.data?.summary.compliant ?? 0)} />
              <Metric
                label="Questionable"
                value={String(portfolioQuery.data?.summary.questionable ?? 0)}
              />
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.statusTitle}>Portfolio analytics</Text>
              <Text style={styles.statusBody}>
                Estimated purification mix:{" "}
                {toPercent(portfolioQuery.data?.summary.estimatedPurificationRatio ?? 0)}
              </Text>
              <Text style={styles.statusBody}>
                Non-compliant positions: {portfolioQuery.data?.summary.nonCompliant ?? 0}
              </Text>
              {portfolioQuery.data?.summary.concentrationWarning ? (
                <Text style={styles.warningText}>
                  {portfolioQuery.data.summary.concentrationWarning}
                </Text>
              ) : (
                <Text style={styles.statusBody}>
                  No single holding currently dominates tracked portfolio units.
                </Text>
              )}
            </View>
            <AllocationCard
              compliant={portfolioQuery.data?.summary.compliant ?? 0}
              questionable={portfolioQuery.data?.summary.questionable ?? 0}
              nonCompliant={portfolioQuery.data?.summary.nonCompliant ?? 0}
            />
            <View style={styles.analyticsCard}>
              <Text style={styles.statusTitle}>Purification planning</Text>
              <Text style={styles.statusBody}>
                Holdings with purification exposure: {purificationHoldings.length}
              </Text>
              {highestPurificationHolding ? (
                <Text style={styles.statusBody}>
                  Highest flagged holding: {highestPurificationHolding.ticker} at{" "}
                  {toPercent(highestPurificationHolding.purificationRatio ?? 0)}
                </Text>
              ) : (
                <Text style={styles.statusBody}>
                  No current holdings carry a positive purification ratio.
                </Text>
              )}
              <Text style={styles.statusBody}>
                Use this as a planning cue before making donation or purification decisions.
              </Text>
            </View>
            {portfolioReportQuery.data ? (
              <View style={styles.analyticsCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.statusTitle}>Portfolio report</Text>
                  <View style={styles.reportActions}>
                    <Pressable
                      onPress={() => void handleShareReport()}
                      style={[
                        styles.secondaryButton,
                        styles.reportButton,
                        isSharingReport && styles.actionButtonDisabled,
                      ]}
                      disabled={isSharingReport}
                    >
                      <Text style={styles.secondaryButtonLabel}>
                        {isSharingReport ? "Sharing..." : "Share report"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void handleOpenPdfPack()}
                      style={[
                        styles.actionButton,
                        styles.reportButton,
                        isOpeningPdf && styles.actionButtonDisabled,
                      ]}
                      disabled={isOpeningPdf}
                    >
                      <Text style={styles.actionButtonLabel}>
                        {isOpeningPdf ? "Preparing PDF..." : "Open PDF pack"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.statusBody}>{portfolioReportQuery.data.headline}</Text>
                <Text style={styles.resultMeta}>
                  Generated {new Date(portfolioReportQuery.data.generatedAt).toLocaleString()}
                </Text>
                <Text style={styles.resultMeta}>{portfolioReportQuery.data.fileName}</Text>
                {portfolioReportQuery.data.sections.map((section) => (
                  <View key={section.title} style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>{section.title}</Text>
                    {section.body.map((line) => (
                      <Text key={line} style={styles.statusBody}>
                        • {line}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.analyticsCard}>
              <Text style={styles.statusTitle}>Decision timeline</Text>
              {activityQuery.isLoading ? (
                <Text style={styles.statusBody}>Loading recent screening decisions...</Text>
              ) : activityQuery.isError ? (
                <Text style={styles.errorText}>
                  {activityQuery.error instanceof Error
                    ? activityQuery.error.message
                    : "Screening activity could not be loaded."}
                </Text>
              ) : (activityQuery.data?.events ?? []).length > 0 ? (
                activityQuery.data?.events.map((event) => (
                  <ActivityRow key={event.id} event={event} />
                ))
              ) : (
                <Text style={styles.statusBody}>
                  Save or update watchlist and portfolio decisions to build a timeline here.
                </Text>
              )}
            </View>
            {(portfolioQuery.data?.holdings ?? []).length > 0 ? (
              (portfolioQuery.data?.holdings ?? []).map((holding) => (
                <PortfolioRow
                  key={holding.ticker}
                  holding={holding}
                  onSelect={() => setSelectedTicker(holding.ticker)}
                />
              ))
            ) : (
              <Text style={styles.helper}>
                Add a selected asset to begin a simple portfolio mix summary.
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.watchlistCard}>
        <Text style={styles.sectionTitle}>Saved watchlist</Text>
        {watchlistQuery.isLoading ? (
          <Text style={styles.helper}>Loading your watchlist...</Text>
        ) : watchlistQuery.isError ? (
          <Text style={styles.errorText}>
            {watchlistQuery.error instanceof Error
              ? watchlistQuery.error.message
              : "Watchlist could not be loaded."}
          </Text>
        ) : (watchlistQuery.data?.items ?? []).length > 0 ? (
          watchlistQuery.data?.items.map((item) => (
            <Pressable
              key={item.ticker}
              onPress={() => setSelectedTicker(item.ticker)}
              style={styles.watchlistRow}
            >
              <View style={styles.resultCopy}>
                <Text style={styles.resultTicker}>{item.ticker}</Text>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeta}>
                  Added {new Date(item.addedAt).toLocaleDateString()} · {item.dataFreshness}
                </Text>
              </View>
              <View style={[styles.badge, badgeStyle(item.classification)]}>
                <Text style={styles.badgeLabel}>{item.classification}</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={styles.helper}>
            Save a result to the watchlist so you can revisit its current classification quickly.
          </Text>
        )}
      </View>
    </ScreenShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function AllocationCard({
  compliant,
  questionable,
  nonCompliant,
}: {
  compliant: number;
  questionable: number;
  nonCompliant: number;
}) {
  const total = compliant + questionable + nonCompliant;
  const segments =
    total > 0
      ? [
          {
            key: "compliant",
            label: "Compliant",
            count: compliant,
            share: compliant / total,
            color: "#7AB08D",
          },
          {
            key: "questionable",
            label: "Questionable",
            count: questionable,
            share: questionable / total,
            color: "#D9B35F",
          },
          {
            key: "non-compliant",
            label: "Non-compliant",
            count: nonCompliant,
            share: nonCompliant / total,
            color: "#C7846E",
          },
        ].filter((segment) => segment.count > 0)
      : [];

  return (
    <View style={styles.analyticsCard}>
      <Text style={styles.statusTitle}>Classification mix</Text>
      {total > 0 ? (
        <>
          <View style={styles.allocationBar}>
            {segments.map((segment) => (
              <View
                key={segment.key}
                style={[
                  styles.allocationSegment,
                  { backgroundColor: segment.color, flex: Math.max(segment.share, 0.12) },
                ]}
              />
            ))}
          </View>
          <View style={styles.allocationLegend}>
            {segments.map((segment) => (
              <View key={segment.key} style={styles.allocationLegendRow}>
                <View style={[styles.allocationDot, { backgroundColor: segment.color }]} />
                <Text style={styles.allocationLabel}>
                  {segment.label}: {segment.count} ({Math.round(segment.share * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.statusBody}>
          Add holdings to see the portfolio allocation across compliant, questionable, and
          non-compliant classifications.
        </Text>
      )}
    </View>
  );
}

function PortfolioRow({
  holding,
  onSelect,
}: {
  holding: ScreeningPortfolioHolding;
  onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} style={styles.watchlistRow}>
      <View style={styles.resultCopy}>
        <Text style={styles.resultTicker}>{holding.ticker}</Text>
        <Text style={styles.resultName}>{holding.name}</Text>
        <Text style={styles.resultMeta}>
          {holding.units} units · updated {new Date(holding.updatedAt).toLocaleDateString()}
        </Text>
        {holding.purificationRatio ? (
          <Text style={styles.resultMeta}>
            Purification {toPercent(holding.purificationRatio)}
          </Text>
        ) : null}
      </View>
      <View style={[styles.badge, badgeStyle(holding.classification)]}>
        <Text style={styles.badgeLabel}>{holding.classification}</Text>
      </View>
    </Pressable>
  );
}

function ActivityRow({ event }: { event: ScreeningActivityEvent }) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityMarker} />
      <View style={styles.resultCopy}>
        <Text style={styles.resultTicker}>{event.ticker}</Text>
        <Text style={styles.resultName}>{event.note}</Text>
        <Text style={styles.resultMeta}>{new Date(event.occurredAt).toLocaleString()}</Text>
      </View>
    </View>
  );
}

function toPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function apiBaseOrigin() {
  return appEnv.apiBaseUrl.replace(/\/api$/, "");
}

function badgeStyle(classification: ScreeningAssetDetail["classification"]) {
  switch (classification) {
    case "compliant":
      return { backgroundColor: "#E6F2EC", borderColor: "#BCD8C8" };
    case "questionable":
      return { backgroundColor: "#F8F0DE", borderColor: "#E5C987" };
    default:
      return { backgroundColor: "#F8E7E0", borderColor: "#D6A796" };
  }
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: designTokens.colors.deepGreen,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  actionCluster: {
    gap: designTokens.spacing.xs ?? 8,
  },
  activityMarker: {
    backgroundColor: designTokens.colors.gold,
    borderRadius: 999,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  activityRow: {
    borderTopColor: "#ECE7DB",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: designTokens.spacing.sm,
    paddingTop: designTokens.spacing.sm,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    color: designTokens.colors.deepGreen,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  analyticsCard: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D3E5DA",
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: designTokens.spacing.sm,
  },
  allocationBar: {
    backgroundColor: "#EEF3F0",
    borderRadius: 999,
    flexDirection: "row",
    overflow: "hidden",
    minHeight: 12,
  },
  allocationDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  allocationLabel: {
    color: designTokens.colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  allocationLegend: {
    gap: 8,
    marginTop: 4,
  },
  allocationLegendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  allocationSegment: {
    minWidth: 12,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  detailDescription: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  detailHeader: {
    gap: designTokens.spacing.sm,
  },
  detailName: {
    color: designTokens.colors.deepGreen,
    fontSize: 20,
    fontWeight: "700",
  },
  detailTicker: {
    color: designTokens.colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  errorText: {
    color: designTokens.colors.alert,
    lineHeight: 21,
  },
  flexButton: {
    flex: 1,
  },
  helper: {
    color: designTokens.colors.ink,
    lineHeight: 20,
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
  methodologyText: {
    color: "#5B6964",
    lineHeight: 20,
  },
  metricCard: {
    backgroundColor: "#FFFCF7",
    borderColor: "#E9E1D2",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: designTokens.spacing.sm,
  },
  metricLabel: {
    color: "#5B6964",
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: designTokens.spacing.sm,
  },
  metricValue: {
    color: designTokens.colors.deepGreen,
    fontSize: 16,
    fontWeight: "700",
  },
  miniChip: {
    backgroundColor: "#EFF5F1",
    borderColor: "#D2E3D9",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniChipLabel: {
    color: designTokens.colors.deepGreen,
    fontSize: 11,
    fontWeight: "700",
  },
  portfolioActions: {
    flexDirection: "row",
    gap: designTokens.spacing.sm,
  },
  portfolioComposer: {
    gap: designTokens.spacing.sm,
  },
  purification: {
    color: designTokens.colors.alert,
    lineHeight: 21,
  },
  reportSection: {
    gap: 4,
    marginTop: 6,
  },
  reportHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: designTokens.spacing.sm,
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reportActions: {
    flexDirection: "row",
    gap: designTokens.spacing.sm,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  reportSectionTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  quickLookupChip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E3D7BF",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  quickLookupLabel: {
    color: designTokens.colors.deepGreen,
    fontSize: 12,
    fontWeight: "700",
  },
  quickLookupRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.spacing.xs ?? 8,
  },
  reasonRow: {
    color: designTokens.colors.ink,
    lineHeight: 21,
  },
  resultBadges: {
    alignItems: "flex-end",
    gap: 6,
  },
  resultCopy: {
    flex: 1,
    gap: 2,
  },
  resultMeta: {
    color: "#5B6964",
    fontSize: 12,
  },
  resultName: {
    color: designTokens.colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  resultsCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  resultRow: {
    alignItems: "center",
    borderColor: "#ECE7DB",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.sm,
  },
  resultRowActive: {
    backgroundColor: "#F4F7F5",
    borderColor: designTokens.colors.deepGreen,
  },
  resultTicker: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: 14,
    borderWidth: 1,
    color: designTokens.colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#EAF2EE",
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryButtonLabel: {
    color: designTokens.colors.deepGreen,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 18,
    fontWeight: "700",
  },
  statusBody: {
    color: designTokens.colors.ink,
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D3E5DA",
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: designTokens.spacing.sm,
  },
  statusTitle: {
    color: designTokens.colors.deepGreen,
    fontSize: 13,
    fontWeight: "700",
  },
  summaryLabel: {
    color: "#5B6964",
    fontSize: 12,
  },
  summaryPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7DECF",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: designTokens.spacing.sm,
  },
  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designTokens.spacing.sm,
  },
  summaryValue: {
    color: designTokens.colors.deepGreen,
    fontSize: 16,
    fontWeight: "700",
  },
  watchlistCard: {
    backgroundColor: "#FFFFFF",
    borderColor: designTokens.colors.mist,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
  },
  watchlistHint: {
    color: "#5B6964",
    lineHeight: 20,
  },
  watchlistRow: {
    alignItems: "center",
    borderTopColor: "#ECE7DB",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: designTokens.spacing.sm,
    paddingTop: designTokens.spacing.sm,
  },
  warningText: {
    color: designTokens.colors.alert,
    lineHeight: 20,
  },
});
