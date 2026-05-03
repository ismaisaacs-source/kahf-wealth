export const subscriptionPlans = {
  free: {
    zakatHistory: false,
    advancedReports: false,
    screeningLookupsPerMonth: 10,
    estateExports: false,
    documentVault: false,
  },
  premium: {
    zakatHistory: true,
    advancedReports: true,
    screeningLookupsPerMonth: 200,
    estateExports: true,
    documentVault: true,
  },
} as const;

export const paidServices = {
  estatePlanningPack: {
    sku: "estate-pack",
    title: "Estate Planning Pack",
  },
  attorneyReviewedIslamicWill: {
    sku: "attorney-reviewed-will",
    title: "Attorney-Reviewed Islamic Will",
  },
} as const;
