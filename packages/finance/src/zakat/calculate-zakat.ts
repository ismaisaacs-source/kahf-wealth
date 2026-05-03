import type {
  ZakatCalculationInput,
  ZakatCalculationResult,
} from "@kahf/domain";

const ZAKAT_RATE = 0.025;

export function calculateZakat(
  input: ZakatCalculationInput,
): ZakatCalculationResult {
  const totalAssetsAmount = input.assets.reduce((sum, asset) => {
    const zakatablePortion = asset.zakatablePortion ?? 1;
    return sum + asset.amount * zakatablePortion;
  }, 0);

  const deductibleLiabilitiesAmount = input.liabilities.reduce((sum, liability) => {
    return liability.dueWithinYear ? sum + liability.amount : sum;
  }, 0);

  const netAmount = Math.max(totalAssetsAmount - deductibleLiabilitiesAmount, 0);
  const aboveNisab = netAmount >= input.nisab;
  const zakatDueAmount = aboveNisab ? roundCurrency(netAmount * ZAKAT_RATE) : 0;

  return {
    totalAssets: money(totalAssetsAmount, input.currency),
    deductibleLiabilities: money(deductibleLiabilitiesAmount, input.currency),
    netZakatableAssets: money(netAmount, input.currency),
    zakatDue: money(zakatDueAmount, input.currency),
    aboveNisab,
    assumptions: [
      "Only liabilities due within the coming year are deducted.",
      "Asset categories may use a zakatable portion to support methodology evolution.",
      "Result is intended for planning support and should be reviewed with your preferred scholarly guidance.",
    ],
  };
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function money(amount: number, currency: string) {
  return {
    amount: roundCurrency(amount),
    currency,
  };
}
