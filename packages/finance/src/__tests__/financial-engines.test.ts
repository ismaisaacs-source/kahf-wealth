import { describe, expect, it } from "vitest";
import {
  buildEstateHandoffPayload,
  calculateEstateReadiness,
  calculateZakat,
  classifyAsset,
} from "../index";

describe("calculateZakat", () => {
  it("calculates zakat after deductible liabilities", () => {
    const result = calculateZakat({
      assets: [
        { label: "Cash", amount: 10000, category: "cash" },
        { label: "Gold", amount: 5000, category: "gold", zakatablePortion: 1 },
      ],
      liabilities: [{ label: "Credit", amount: 2000, dueWithinYear: true }],
      nisab: 4000,
      currency: "USD",
    });

    expect(result.netZakatableAssets.amount).toBe(13000);
    expect(result.zakatDue.amount).toBe(325);
    expect(result.aboveNisab).toBe(true);
  });
});

describe("classifyAsset", () => {
  it("marks prohibited sectors as non-compliant", () => {
    const result = classifyAsset({
      ticker: "RIBA",
      sector: "conventional_finance",
      debtToAssetsRatio: 0.1,
      impureIncomeRatio: 0.01,
      cashToAssetsRatio: 0.2,
    });

    expect(result.classification).toBe("non-compliant");
  });
});

describe("calculateEstateReadiness", () => {
  const estatePlan = {
    id: "estate-1",
    userId: "user-1",
    status: "draft_in_progress_locally",
    maritalStatus: "married",
    familyMembers: [
      {
        id: "fm-1",
        relationship: "spouse",
        fullName: "Amina",
        alive: true,
      },
      {
        id: "fm-2",
        relationship: "child",
        fullName: "Yusuf",
        alive: true,
        dependent: true,
      },
    ],
    executors: [],
    guardians: [],
    assets: [],
    liabilities: [],
    createdAt: "2026-04-12T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
  } as const;

  it("identifies missing readiness items", () => {
    const result = calculateEstateReadiness(estatePlan as never);

    expect(result.missingItems.length).toBeGreaterThan(3);
    expect(result.readinessScore).toBeLessThan(80);
  });
});

describe("buildEstateHandoffPayload", () => {
  it("normalizes estate data for downstream submission", () => {
    const payload = buildEstateHandoffPayload({
      estatePlan: {
        id: "estate-1",
        userId: "user-1",
        status: "ready_for_submission",
        maritalStatus: "married",
        familyMembers: [],
        executors: [],
        guardians: [],
        assets: [],
        liabilities: [],
        createdAt: "2026-04-12T00:00:00.000Z",
        updatedAt: "2026-04-12T00:00:00.000Z",
      } as never,
      userProfile: {
        userId: "user-1",
        fullName: "Fatima Khan",
        language: "en",
      },
      summary: {
        estatePlanId: "estate-1",
        readinessScore: 88,
        missingItems: [],
        likelyHeirs: [],
        summaryText: "Ready",
      },
    });

    expect(payload.client.fullName).toBe("Fatima Khan");
    expect(payload.requestedService).toBe("attorney_reviewed_islamic_will");
  });
});
