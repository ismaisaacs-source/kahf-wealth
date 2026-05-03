import type {
  EstatePlan,
  EstateSummary,
  FamilyMember,
  Liability,
  Money,
  ScreeningMethodologyVersion,
} from "./models";
import type { ComplianceClassification, EstateHandoffStatus } from "./enums";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ZakatCalculationInput {
  assets: Array<{
    label: string;
    amount: number;
    category: string;
    zakatablePortion?: number;
  }>;
  liabilities: Array<{
    label: string;
    amount: number;
    dueWithinYear: boolean;
  }>;
  nisab: number;
  currency: string;
}

export interface ZakatCalculationResult {
  totalAssets: Money;
  deductibleLiabilities: Money;
  netZakatableAssets: Money;
  zakatDue: Money;
  aboveNisab: boolean;
  assumptions: string[];
}

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName?: string;
  tokenMode: "verified" | "decoded_unverified";
}

export interface AuthSessionResponse {
  user: AuthenticatedUser;
  profile: {
    userId: string;
    fullName: string;
    language: "en" | "ar" | "ur";
    plan: "free" | "premium";
  };
  subscription: {
    plan: "free" | "premium";
    features: Record<string, boolean | number>;
  };
}

export interface SavedZakatReport extends ZakatCalculationResult {
  id: string;
  userId: string;
  generatedAt: string;
  input: ZakatCalculationInput;
}

export interface ZakatHistoryResponse {
  latest?: SavedZakatReport;
  history: SavedZakatReport[];
}

export interface ScreeningInput {
  ticker: string;
  sector: string;
  debtToAssetsRatio: number;
  impureIncomeRatio: number;
  cashToAssetsRatio: number;
}

export interface ScreeningAssetSummary {
  ticker: string;
  name: string;
  sector: string;
  kind: "stock" | "etf";
  exchange: string;
  description: string;
  dataFreshness: string;
  checkedAt: string;
}

export interface ScreeningResult {
  ticker: string;
  classification: ComplianceClassification;
  reasons: string[];
  purificationRatio?: number;
  methodology: ScreeningMethodologyVersion;
  checkedAt: string;
}

export interface ScreeningAssetDetail extends ScreeningResult {
  asset: ScreeningAssetSummary;
  metrics: {
    debtToAssetsRatio: number;
    impureIncomeRatio: number;
    cashToAssetsRatio: number;
  };
}

export interface ScreeningSearchResponse {
  query: string;
  results: ScreeningAssetDetail[];
  methodology: ScreeningMethodologyVersion;
  disclaimer: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  addedAt: string;
  classification: ComplianceClassification;
  dataFreshness: string;
}

export interface ScreeningWatchlistResponse {
  items: WatchlistItem[];
  methodology: ScreeningMethodologyVersion;
}

export interface ScreeningPortfolioHolding {
  ticker: string;
  name: string;
  units: number;
  classification: ComplianceClassification;
  purificationRatio?: number;
  updatedAt: string;
}

export interface ScreeningPortfolioResponse {
  holdings: ScreeningPortfolioHolding[];
  summary: {
    positions: number;
    totalUnits: number;
    compliant: number;
    questionable: number;
    nonCompliant: number;
    concentrationWarning?: string;
    estimatedPurificationRatio: number;
  };
}

export interface ScreeningActivityEvent {
  id: string;
  ticker: string;
  type:
    | "watchlist_added"
    | "watchlist_removed"
    | "portfolio_added"
    | "portfolio_updated"
    | "portfolio_removed";
  occurredAt: string;
  note: string;
}

export interface ScreeningActivityResponse {
  events: ScreeningActivityEvent[];
}

export interface ScreeningPortfolioReportResponse {
  generatedAt: string;
  fileName: string;
  headline: string;
  shareBody: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
}

export interface ScreeningPortfolioPdfPackResponse {
  generatedAt: string;
  fileName: string;
  downloadPath: string;
}

export interface EstateReadinessResult extends EstateSummary {}

export interface EstateFoundationInput {
  maritalStatus: EstatePlan["maritalStatus"];
  jurisdiction?: string;
  spouseName?: string;
  childrenCount: number;
  executorName?: string;
  guardianName?: string;
  assetEstimate: number;
  liabilityEstimate: number;
  burialPreferences?: string;
  bequestNotes?: string;
}

export interface NormalizedEstateHandoffPayload {
  estatePlanId: string;
  client: {
    fullName: string;
    email?: string;
    jurisdiction?: string;
  };
  family: FamilyMember[];
  estate: {
    assets: EstatePlan["assets"];
    liabilities: EstatePlan["liabilities"];
    bequestNotes?: string;
    charitableWishes?: string;
    burialPreferences?: string;
  };
  summary: EstateSummary;
  requestedService: "attorney_reviewed_islamic_will";
}

export interface EstateHandoffSubmissionResult {
  status: EstateHandoffStatus;
  reference: string;
}

export interface EstateValidationResult {
  isReady: boolean;
  missingItems: string[];
}

export interface PdfRenderRequest {
  title: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
}

export interface EstateSummaryDocument {
  fileName: string;
  request: PdfRenderRequest;
}

export interface MethodologyResponse {
  versions: ScreeningMethodologyVersion[];
  notes: Array<{
    versionId: string;
    title: string;
    content: string;
  }>;
  disclaimers: {
    methodologyTitle: string;
    screeningDisclaimer: string;
    estateDisclaimer: string;
    zakatDisclaimer: string;
  };
}

export interface EstateCreateDto {
  maritalStatus: EstatePlan["maritalStatus"];
  jurisdiction?: string;
}

export interface EstateUpdateDto extends Partial<Omit<EstatePlan, "id" | "userId" | "createdAt" | "updatedAt">> {}

export interface LiabilityDto extends Liability {}
