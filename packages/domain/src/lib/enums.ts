export type LanguageCode = "en" | "ar" | "ur";

export type ComplianceClassification =
  | "compliant"
  | "questionable"
  | "non-compliant";

export type SubscriptionPlan = "free" | "premium";

export type EstateHandoffStatus =
  | "not_started"
  | "draft_in_progress_locally"
  | "ready_for_submission"
  | "queued"
  | "sent"
  | "received"
  | "under_review"
  | "drafting_in_progress"
  | "draft_produced"
  | "final_review"
  | "completed"
  | "failed";

export type AssetCategory =
  | "cash"
  | "savings"
  | "gold"
  | "silver"
  | "stocks"
  | "etfs"
  | "retirement"
  | "business_assets"
  | "receivables";

export type EstateRelationship =
  | "self"
  | "spouse"
  | "child"
  | "parent"
  | "sibling"
  | "guardian"
  | "executor"
  | "other";

export type MethodologyKind = "screening" | "zakat" | "estate";
