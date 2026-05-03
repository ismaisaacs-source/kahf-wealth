import type { EstatePlan, EstateReadinessResult } from "@kahf/domain";
import { buildHeirSummary } from "./build-heir-summary";

export function calculateEstateReadiness(
  estatePlan: EstatePlan,
): EstateReadinessResult {
  const missingItems: string[] = [];

  if (!estatePlan.jurisdiction) {
    missingItems.push("Jurisdiction or governing location is missing.");
  }

  if (estatePlan.executors.length === 0) {
    missingItems.push("At least one executor should be identified.");
  }

  const hasMinorChildren = estatePlan.familyMembers.some(
    (member) => member.relationship === "child" && member.alive && member.dependent,
  );

  if (hasMinorChildren && estatePlan.guardians.length === 0) {
    missingItems.push("Guardian details are recommended for minor children.");
  }

  if (estatePlan.assets.length === 0) {
    missingItems.push("Estate assets have not been added.");
  }

  if (estatePlan.liabilities.length === 0) {
    missingItems.push("Estate liabilities have not been reviewed.");
  }

  if (!estatePlan.burialPreferences) {
    missingItems.push("Burial preferences have not been recorded.");
  }

  const score = Math.max(25, 100 - missingItems.length * 12);

  return {
    estatePlanId: estatePlan.id,
    readinessScore: score,
    missingItems,
    likelyHeirs: buildHeirSummary(estatePlan.familyMembers),
    summaryText:
      score >= 80
        ? "The estate plan appears substantially prepared for attorney review."
        : "The estate plan has meaningful gaps to resolve before attorney submission.",
  };
}
