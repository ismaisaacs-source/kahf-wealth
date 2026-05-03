import type { EstateFoundationInput, EstatePlan, EstateReadinessResult } from "@kahf/domain";
import { calculateEstateReadiness } from "@kahf/finance";
import { readDatabase, writeDatabase } from "../../lib/file-database";

export class RuntimeEstateService {
  async getPlan(userId: string): Promise<EstatePlan> {
    const database = await readDatabase();
    const existing = database.estatePlans.find((plan) => plan.userId === userId);

    if (existing) {
      return existing;
    }

    const next = createEmptyPlan(userId);
    database.estatePlans.push(next);
    await writeDatabase(database);
    return next;
  }

  async saveFoundation(userId: string, input: EstateFoundationInput): Promise<EstatePlan> {
    const database = await readDatabase();
    const existingIndex = database.estatePlans.findIndex((plan) => plan.userId === userId);
    const base = existingIndex >= 0 ? database.estatePlans[existingIndex] : createEmptyPlan(userId);

    const familyMembers = [];
    if (input.spouseName?.trim()) {
      familyMembers.push({
        id: "family-spouse",
        relationship: "spouse" as const,
        fullName: input.spouseName.trim(),
        alive: true,
      });
    }

    for (let index = 0; index < input.childrenCount; index += 1) {
      familyMembers.push({
        id: `family-child-${index + 1}`,
        relationship: "child" as const,
        fullName: `Child ${index + 1}`,
        alive: true,
        dependent: true,
      });
    }

    const next: EstatePlan = {
      ...base,
      maritalStatus: input.maritalStatus,
      jurisdiction: input.jurisdiction?.trim() || undefined,
      familyMembers,
      executors: input.executorName?.trim()
        ? [
            {
              id: "executor-1",
              relationship: "executor",
              fullName: input.executorName.trim(),
              alive: true,
            },
          ]
        : [],
      guardians: input.guardianName?.trim()
        ? [
            {
              id: "guardian-1",
              relationship: "guardian",
              fullName: input.guardianName.trim(),
              alive: true,
            },
          ]
        : [],
      assets:
        input.assetEstimate > 0
          ? [
              {
                id: "asset-estimate",
                label: "Estimated total estate assets",
                value: { amount: input.assetEstimate, currency: "USD" },
                ownershipType: "individual",
              },
            ]
          : [],
      liabilities:
        input.liabilityEstimate > 0
          ? [
              {
                id: "liability-estimate",
                label: "Estimated total estate liabilities",
                amount: { amount: input.liabilityEstimate, currency: "USD" },
                secured: false,
              },
            ]
          : [],
      burialPreferences: input.burialPreferences?.trim() || undefined,
      bequestNotes: input.bequestNotes?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      database.estatePlans[existingIndex] = next;
    } else {
      database.estatePlans.push(next);
    }

    await writeDatabase(database);
    return next;
  }

  async getReadiness(userId: string): Promise<EstateReadinessResult> {
    const plan = await this.getPlan(userId);
    return calculateEstateReadiness(plan);
  }
}

function createEmptyPlan(userId: string): EstatePlan {
  const timestamp = new Date().toISOString();
  return {
    id: `estate-${userId}`,
    userId,
    status: "draft_in_progress_locally",
    maritalStatus: "single",
    jurisdiction: "",
    familyMembers: [],
    executors: [],
    guardians: [],
    assets: [],
    liabilities: [],
    burialPreferences: "",
    bequestNotes: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
