import type {
  AssetCategory,
  ComplianceClassification,
  EstateHandoffStatus,
  EstateRelationship,
  LanguageCode,
  MethodologyKind,
  SubscriptionPlan,
} from "./enums";

export interface Money {
  amount: number;
  currency: string;
}

export interface User {
  id: string;
  email: string;
  authProvider: "firebase";
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  phoneNumber?: string;
  countryCode?: string;
  madhhabPreference?: string;
  language: LanguageCode;
}

export interface Preferences {
  language: LanguageCode;
  enableBiometricLock: boolean;
  premiumUpsellDismissed: boolean;
}

export interface NotificationSettings {
  zakatReminders: boolean;
  prayerReminders: boolean;
  estateChecklistReminders: boolean;
  screeningAlerts: boolean;
}

export interface Asset {
  id: string;
  category: AssetCategory;
  label: string;
  marketValue: Money;
  zakatablePortion?: number;
}

export interface Liability {
  id: string;
  label: string;
  outstandingAmount: Money;
  dueWithinYear: boolean;
}

export interface ZakatProfile {
  userId: string;
  nisabValue: Money;
  hawlStartDate?: string;
  calculationMode: "simple" | "advanced";
}

export interface HawlCycle {
  userId: string;
  startDate: string;
  nextDueDate: string;
  lunarYearDays: number;
}

export interface ZakatReport {
  id: string;
  userId: string;
  generatedAt: string;
  netZakatableAssets: Money;
  zakatDue: Money;
  assumptions: string[];
}

export interface Watchlist {
  id: string;
  userId: string;
  tickerSymbols: string[];
}

export interface Holding {
  ticker: string;
  units: number;
  costBasis?: Money;
  currentValue?: Money;
}

export interface Portfolio {
  id: string;
  userId: string;
  holdings: Holding[];
}

export interface ComplianceSnapshot {
  assetId: string;
  ticker: string;
  checkedAt: string;
  methodologyVersion: string;
  classification: ComplianceClassification;
  reasons: string[];
  purificationRatio?: number;
}

export interface ScreeningMethodologyVersion {
  id: string;
  version: string;
  kind: MethodologyKind;
  effectiveDate: string;
  summary: string;
  disclaimer: string;
}

export interface PurificationRecord {
  id: string;
  userId: string;
  ticker: string;
  amount: Money;
  note?: string;
}

export interface FamilyMember {
  id: string;
  relationship: EstateRelationship;
  fullName: string;
  alive: boolean;
  dateOfBirth?: string;
  dependent?: boolean;
}

export interface EstateAsset {
  id: string;
  label: string;
  value: Money;
  ownershipType: "individual" | "joint" | "trust";
}

export interface EstateLiability {
  id: string;
  label: string;
  amount: Money;
  secured: boolean;
}

export interface EstatePlan {
  id: string;
  userId: string;
  status: EstateHandoffStatus;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  familyMembers: FamilyMember[];
  executors: FamilyMember[];
  guardians: FamilyMember[];
  assets: EstateAsset[];
  liabilities: EstateLiability[];
  burialPreferences?: string;
  charitableWishes?: string;
  bequestNotes?: string;
  supportingNotes?: string;
  jurisdiction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeirProfile {
  relationship: EstateRelationship;
  count: number;
  notes: string;
}

export interface EstateSummary {
  estatePlanId: string;
  readinessScore: number;
  missingItems: string[];
  likelyHeirs: HeirProfile[];
  summaryText: string;
}

export interface EstateHandoff {
  id: string;
  estatePlanId: string;
  status: EstateHandoffStatus;
  submittedAt?: string;
  externalReference?: string;
  failureReason?: string;
}

export interface Document {
  id: string;
  userId: string;
  kind: "zakat_report" | "estate_intake" | "identity" | "supporting";
  storageKey: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  readAt?: string;
}

export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  startedAt: string;
  renewalDate?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface MethodologyNote {
  id: string;
  methodologyVersionId: string;
  scholarName?: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: "super_admin" | "reviewer" | "support";
}
