import type {
  EstatePlan,
  EstateSummary,
  NormalizedEstateHandoffPayload,
  UserProfile,
} from "@kahf/domain";

export function buildEstateHandoffPayload(params: {
  estatePlan: EstatePlan;
  userProfile: UserProfile;
  summary: EstateSummary;
}): NormalizedEstateHandoffPayload {
  const { estatePlan, userProfile, summary } = params;

  return {
    estatePlanId: estatePlan.id,
    client: {
      fullName: userProfile.fullName,
      jurisdiction: estatePlan.jurisdiction,
    },
    family: estatePlan.familyMembers,
    estate: {
      assets: estatePlan.assets,
      liabilities: estatePlan.liabilities,
      bequestNotes: estatePlan.bequestNotes,
      charitableWishes: estatePlan.charitableWishes,
      burialPreferences: estatePlan.burialPreferences,
    },
    summary,
    requestedService: "attorney_reviewed_islamic_will",
  };
}
