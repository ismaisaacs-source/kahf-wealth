import { methodologyVersions, trustCopy } from "@kahf/config";
import type {
  ComplianceClassification,
  ScreeningActivityResponse,
  ScreeningAssetDetail,
  ScreeningPortfolioPdfPackResponse,
  ScreeningPortfolioResponse,
  ScreeningPortfolioReportResponse,
  ScreeningAssetSummary,
  ScreeningInput,
  ScreeningSearchResponse,
  ScreeningWatchlistResponse,
  PdfRenderRequest,
} from "@kahf/domain";
import { classifyAsset } from "@kahf/finance";
import { readDatabase, writeDatabase } from "../../lib/file-database";
import { RuntimeDocumentsService } from "../documents/runtime-documents.service";

export class ScreeningService {
  private readonly documentsService = new RuntimeDocumentsService();

  classify(input: ScreeningInput) {
    return classifyAsset(input);
  }

  search(query: string): ScreeningSearchResponse {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = SCREENING_UNIVERSE.filter((asset) => {
      if (!normalizedQuery) {
        return asset.featured;
      }

      return (
        asset.ticker.toLowerCase().includes(normalizedQuery) ||
        asset.name.toLowerCase().includes(normalizedQuery) ||
        asset.sector.replace(/_/g, " ").includes(normalizedQuery)
      );
    }).map((asset) => this.getAssetDetail(asset.ticker));

    return {
      query,
      results: matches,
      methodology: methodologyVersions[0],
      disclaimer: trustCopy.screeningDisclaimer,
    };
  }

  getAssetDetail(ticker: string): ScreeningAssetDetail {
    const asset = SCREENING_UNIVERSE.find((entry) => entry.ticker === ticker.toUpperCase());

    if (!asset) {
      throw new Error("Asset not found.");
    }

    const input: ScreeningInput = {
      ticker: asset.ticker,
      sector: asset.sector,
      debtToAssetsRatio: asset.metrics.debtToAssetsRatio,
      impureIncomeRatio: asset.metrics.impureIncomeRatio,
      cashToAssetsRatio: asset.metrics.cashToAssetsRatio,
    };

    const result = classifyAsset(input);

    return {
      ...result,
      asset: {
        ticker: asset.ticker,
        name: asset.name,
        sector: asset.sector,
        kind: asset.kind,
        exchange: asset.exchange,
        description: asset.description,
        dataFreshness: asset.dataFreshness,
        checkedAt: result.checkedAt,
      },
      metrics: asset.metrics,
    };
  }

  async getWatchlist(userId = "demo-user"): Promise<ScreeningWatchlistResponse> {
    const database = await readDatabase();
    const items = database.screeningWatchlist
      .filter((entry) => entry.userId === userId)
      .map((entry) => {
        const detail = this.getAssetDetail(entry.ticker);
        return {
          ticker: detail.asset.ticker,
          name: detail.asset.name,
          addedAt: entry.addedAt,
          classification: detail.classification,
          dataFreshness: detail.asset.dataFreshness,
        };
      });

    return {
      items,
      methodology: methodologyVersions[0],
    };
  }

  async addToWatchlist(userId: string, ticker: string) {
    const detail = this.getAssetDetail(ticker);
    const database = await readDatabase();
    const exists = database.screeningWatchlist.some(
      (entry) => entry.userId === userId && entry.ticker === detail.asset.ticker,
    );

    if (!exists) {
      database.screeningWatchlist.unshift({
        userId,
        ticker: detail.asset.ticker,
        addedAt: new Date().toISOString(),
      });
      database.screeningActivity.unshift({
        id: buildEventId(),
        userId,
        ticker: detail.asset.ticker,
        type: "watchlist_added",
        occurredAt: new Date().toISOString(),
        note: `${detail.asset.ticker} saved to watchlist.`,
      });
      await writeDatabase(database);
    }

    return this.getWatchlist(userId);
  }

  async removeFromWatchlist(userId: string, ticker: string) {
    const database = await readDatabase();
    database.screeningActivity.unshift({
      id: buildEventId(),
      userId,
      ticker: ticker.toUpperCase(),
      type: "watchlist_removed",
      occurredAt: new Date().toISOString(),
      note: `${ticker.toUpperCase()} removed from watchlist.`,
    });
    database.screeningWatchlist = database.screeningWatchlist.filter(
      (entry) => !(entry.userId === userId && entry.ticker === ticker.toUpperCase()),
    );
    await writeDatabase(database);
    return this.getWatchlist(userId);
  }

  async getPortfolio(userId: string): Promise<ScreeningPortfolioResponse> {
    const database = await readDatabase();
    const holdings = database.screeningPortfolio
      .filter((entry) => entry.userId === userId)
      .map((entry) => {
        const detail = this.getAssetDetail(entry.ticker);
        return {
          ticker: detail.asset.ticker,
          name: detail.asset.name,
          units: entry.units,
          classification: detail.classification,
          purificationRatio: detail.purificationRatio,
          updatedAt: entry.updatedAt,
        };
      });

    return {
      holdings,
      summary: buildPortfolioSummary(holdings),
    };
  }

  async savePortfolioHolding(userId: string, ticker: string, units: number) {
    const detail = this.getAssetDetail(ticker);
    const database = await readDatabase();
    const existing = database.screeningPortfolio.find(
      (entry) => entry.userId === userId && entry.ticker === detail.asset.ticker,
    );

    if (existing) {
      existing.units = units;
      existing.updatedAt = new Date().toISOString();
      database.screeningActivity.unshift({
        id: buildEventId(),
        userId,
        ticker: detail.asset.ticker,
        type: "portfolio_updated",
        occurredAt: new Date().toISOString(),
        note: `${detail.asset.ticker} updated to ${units} units.`,
      });
    } else {
      database.screeningPortfolio.unshift({
        userId,
        ticker: detail.asset.ticker,
        units,
        updatedAt: new Date().toISOString(),
      });
      database.screeningActivity.unshift({
        id: buildEventId(),
        userId,
        ticker: detail.asset.ticker,
        type: "portfolio_added",
        occurredAt: new Date().toISOString(),
        note: `${detail.asset.ticker} added to portfolio at ${units} units.`,
      });
    }

    await writeDatabase(database);
    return this.getPortfolio(userId);
  }

  async removePortfolioHolding(userId: string, ticker: string) {
    const database = await readDatabase();
    database.screeningActivity.unshift({
      id: buildEventId(),
      userId,
      ticker: ticker.toUpperCase(),
      type: "portfolio_removed",
      occurredAt: new Date().toISOString(),
      note: `${ticker.toUpperCase()} removed from portfolio.`,
    });
    database.screeningPortfolio = database.screeningPortfolio.filter(
      (entry) => !(entry.userId === userId && entry.ticker === ticker.toUpperCase()),
    );
    await writeDatabase(database);
    return this.getPortfolio(userId);
  }

  async getActivity(userId: string): Promise<ScreeningActivityResponse> {
    const database = await readDatabase();
    return {
      events: database.screeningActivity
        .filter((entry) => entry.userId === userId)
        .slice(0, 10)
        .map((entry) => ({
          id: entry.id,
          ticker: entry.ticker,
          type: entry.type,
          occurredAt: entry.occurredAt,
          note: entry.note,
        })),
    };
  }

  async getPortfolioReport(userId: string): Promise<ScreeningPortfolioReportResponse> {
    const portfolio = await this.getPortfolio(userId);
    const topHolding = portfolio.holdings
      .slice()
      .sort((left, right) => right.units - left.units)[0];
    const sections = [
      {
        title: "Portfolio summary",
        body: [
          `${portfolio.summary.totalUnits} total tracked units across ${portfolio.summary.positions} positions.`,
          `${portfolio.summary.nonCompliant} non-compliant and ${portfolio.summary.questionable} questionable positions require closer review.`,
        ],
      },
      {
        title: "Purification planning",
        body: [
          `Estimated purification mix: ${Math.round(portfolio.summary.estimatedPurificationRatio * 1000) / 10}%.`,
          portfolio.holdings.some((holding) => (holding.purificationRatio ?? 0) > 0)
            ? "At least one holding currently carries a positive purification ratio."
            : "No current holdings carry a positive purification ratio.",
        ],
      },
      {
        title: "Concentration",
        body: [
          portfolio.summary.concentrationWarning ??
            "No single holding currently dominates tracked units.",
          topHolding
            ? `${topHolding.ticker} is the largest tracked position at ${topHolding.units} units.`
            : "Add holdings to generate a concentration view.",
        ],
      },
    ];
    const headline =
      portfolio.summary.positions > 0
        ? `${portfolio.summary.positions} tracked positions with ${portfolio.summary.compliant} currently classified as compliant.`
        : "No portfolio positions are tracked yet.";

    return {
      generatedAt: new Date().toISOString(),
      fileName: `kahf-screening-portfolio-${new Date().toISOString().slice(0, 10)}.txt`,
      headline,
      shareBody: [
        "Kahf Wealth Screening Portfolio Report",
        headline,
        "",
        ...sections.flatMap((section) => [
          section.title,
          ...section.body.map((line) => `- ${line}`),
          "",
        ]),
      ].join("\n"),
      sections,
    };
  }

  async generatePortfolioPdfPack(userId: string): Promise<ScreeningPortfolioPdfPackResponse> {
    const report = await this.getPortfolioReport(userId);
    const portfolio = await this.getPortfolio(userId);
    const activity = await this.getActivity(userId);
    const request: PdfRenderRequest = {
      title: "Kahf Wealth Screening Portfolio Report",
      sections: [
        {
          heading: "Summary",
          body: [report.headline],
        },
        ...report.sections.map((section) => ({
          heading: section.title,
          body: section.body,
        })),
        {
          heading: "Holdings",
          body:
            portfolio.holdings.length > 0
              ? portfolio.holdings.map(
                  (holding) =>
                    `${holding.ticker}: ${holding.units} units, ${holding.classification}${
                      holding.purificationRatio
                        ? `, purification ${Math.round(holding.purificationRatio * 1000) / 10}%`
                        : ""
                    }`,
                )
              : ["No holdings are currently tracked."],
        },
        {
          heading: "Recent screening decisions",
          body:
            activity.events.length > 0
              ? activity.events.map(
                  (event) =>
                    `${new Date(event.occurredAt).toLocaleString()}: ${event.note}`,
                )
              : ["No recent screening activity yet."],
        },
      ],
    };

    const rendered = await this.documentsService.renderPdfFile(
      request,
      `kahf-screening-portfolio-${new Date().toISOString().slice(0, 10)}.pdf`,
    );

    return {
      generatedAt: new Date().toISOString(),
      fileName: rendered.fileName,
      downloadPath: rendered.downloadPath,
    };
  }
}

function buildEventId() {
  return `screening-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildPortfolioSummary(
  holdings: Array<{
    units: number;
    classification: ComplianceClassification;
    purificationRatio?: number;
  }>,
) {
  const totalUnits = holdings.reduce((sum, holding) => sum + holding.units, 0);
  const topHolding = holdings
    .slice()
    .sort((left, right) => right.units - left.units)[0];
  const topHoldingShare = totalUnits > 0 && topHolding ? topHolding.units / totalUnits : 0;

  return {
    positions: holdings.length,
    totalUnits,
    compliant: holdings.filter((holding) => holding.classification === "compliant").length,
    questionable: holdings.filter((holding) => holding.classification === "questionable").length,
    nonCompliant: holdings.filter((holding) => holding.classification === "non-compliant").length,
    concentrationWarning:
      topHoldingShare >= 0.5
        ? `One holding represents ${Math.round(topHoldingShare * 100)}% of tracked units.`
        : undefined,
    estimatedPurificationRatio:
      totalUnits > 0
        ? holdings.reduce(
            (sum, holding) => sum + holding.units * (holding.purificationRatio ?? 0),
            0,
          ) / totalUnits
        : 0,
  };
}

type UniverseAsset = ScreeningAssetSummary & {
  featured?: boolean;
  metrics: {
    debtToAssetsRatio: number;
    impureIncomeRatio: number;
    cashToAssetsRatio: number;
  };
};

const SCREENING_UNIVERSE: UniverseAsset[] = [
  {
    ticker: "SPUS",
    name: "SP Funds S&P 500 Sharia Industry Exclusions ETF",
    sector: "etf",
    kind: "etf",
    exchange: "NYSEARCA",
    description: "Large-cap U.S. equities screened under a Shariah methodology.",
    dataFreshness: "Refreshed during this app session",
    checkedAt: "",
    featured: true,
    metrics: {
      debtToAssetsRatio: 0.18,
      impureIncomeRatio: 0.01,
      cashToAssetsRatio: 0.22,
    },
  },
  {
    ticker: "HLAL",
    name: "Wahed FTSE USA Shariah ETF",
    sector: "etf",
    kind: "etf",
    exchange: "NASDAQ",
    description: "U.S. equities screened for Shariah-sensitive sector and ratio exclusions.",
    dataFreshness: "Refreshed during this app session",
    checkedAt: "",
    featured: true,
    metrics: {
      debtToAssetsRatio: 0.2,
      impureIncomeRatio: 0.012,
      cashToAssetsRatio: 0.27,
    },
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "technology",
    kind: "stock",
    exchange: "NASDAQ",
    description: "Consumer technology hardware and services issuer.",
    dataFreshness: "Refreshed during this app session",
    checkedAt: "",
    featured: true,
    metrics: {
      debtToAssetsRatio: 0.28,
      impureIncomeRatio: 0.018,
      cashToAssetsRatio: 0.31,
    },
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    sector: "automotive",
    kind: "stock",
    exchange: "NASDAQ",
    description: "Electric vehicle and energy business with ratio sensitivity.",
    dataFreshness: "Refreshed during this app session",
    checkedAt: "",
    featured: true,
    metrics: {
      debtToAssetsRatio: 0.41,
      impureIncomeRatio: 0.021,
      cashToAssetsRatio: 0.42,
    },
  },
  {
    ticker: "BAC",
    name: "Bank of America Corporation",
    sector: "conventional_finance",
    kind: "stock",
    exchange: "NYSE",
    description: "Conventional banking and lending business activity.",
    dataFreshness: "Refreshed during this app session",
    checkedAt: "",
    featured: true,
    metrics: {
      debtToAssetsRatio: 0.91,
      impureIncomeRatio: 0.09,
      cashToAssetsRatio: 0.76,
    },
  },
];
