export const trustCopy = {
  methodologyTitle: "Shariah screening methodology",
  screeningDisclaimer:
    "Classification results are provided for educational and planning support and should be reviewed alongside the published methodology version.",
  estateDisclaimer:
    "Estate-planning assistance helps prepare lawyer-ready intake information and does not replace attorney review or jurisdiction-specific legal advice.",
  zakatDisclaimer:
    "Zakat calculations are based on the selected assumptions and should be reviewed against your preferred scholarly guidance.",
};

export const methodologyVersions = [
  {
    id: "screening-v1",
    version: "2026.04",
    kind: "screening",
    effectiveDate: "2026-04-12",
    summary:
      "Sector exclusions, leverage thresholds, and impure income checks with explainable output.",
    disclaimer: trustCopy.screeningDisclaimer,
  },
  {
    id: "zakat-v1",
    version: "2026.04",
    kind: "zakat",
    effectiveDate: "2026-04-12",
    summary:
      "Net zakatable wealth with configurable nisab, liabilities, and assumption disclosure.",
    disclaimer: trustCopy.zakatDisclaimer,
  },
  {
    id: "estate-v1",
    version: "2026.04",
    kind: "estate",
    effectiveDate: "2026-04-12",
    summary:
      "Readiness guidance and legal-intake preparation for attorney-reviewed Islamic estate planning.",
    disclaimer: trustCopy.estateDisclaimer,
  },
] as const;
