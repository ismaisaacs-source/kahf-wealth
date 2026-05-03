import type { ScreeningInput, ScreeningResult } from "@kahf/domain";
import { methodologyVersions } from "@kahf/config";

const PROHIBITED_SECTORS = new Set([
  "conventional_finance",
  "alcohol",
  "gambling",
  "adult_entertainment",
  "weapons",
  "tobacco",
]);

export function classifyAsset(input: ScreeningInput): ScreeningResult {
  const reasons: string[] = [];
  let classification: ScreeningResult["classification"] = "compliant";
  let purificationRatio: number | undefined;

  if (PROHIBITED_SECTORS.has(input.sector)) {
    classification = "non-compliant";
    reasons.push("Primary business activity falls within an excluded sector.");
  }

  if (input.debtToAssetsRatio > 0.33) {
    classification = classification === "non-compliant" ? classification : "questionable";
    reasons.push("Debt ratio exceeds the reference threshold of 33%.");
  }

  if (input.impureIncomeRatio > 0.05) {
    classification = classification === "non-compliant" ? classification : "questionable";
    purificationRatio = roundRatio(input.impureIncomeRatio);
    reasons.push("Impure income exceeds the reference threshold and may require purification.");
  }

  if (input.cashToAssetsRatio > 0.8) {
    reasons.push("High cash concentration may require additional review of business substance.");
    classification = classification === "compliant" ? "questionable" : classification;
  }

  if (reasons.length === 0) {
    reasons.push("No sector or ratio flags were triggered under the current methodology.");
  }

  return {
    ticker: input.ticker,
    classification,
    reasons,
    purificationRatio,
    methodology: methodologyVersions[0],
    checkedAt: new Date().toISOString(),
  };
}

function roundRatio(value: number): number {
  return Math.round(value * 10000) / 10000;
}
