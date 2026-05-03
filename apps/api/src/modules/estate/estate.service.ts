import { Injectable } from "@nestjs/common";
import type {
  EstateCreateDto,
  EstatePlan,
  EstateUpdateDto,
  UserProfile,
} from "@kahf/domain";
import {
  buildEstateHandoffPayload,
  calculateEstateReadiness,
} from "@kahf/finance";
import { DocumentsService } from "../documents/documents.service";
import { IsaacsIntegrationAdapter } from "./isaacs-integration.adapter";

@Injectable()
export class EstateService {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly isaacsIntegrationAdapter: IsaacsIntegrationAdapter,
  ) {}

  createEstatePlan(input: EstateCreateDto) {
    return {
      id: "estate-demo",
      userId: "demo-user",
      status: "draft_in_progress_locally",
      maritalStatus: input.maritalStatus,
      jurisdiction: input.jurisdiction,
      familyMembers: [],
      executors: [],
      guardians: [],
      assets: [],
      liabilities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  updateEstatePlan(estatePlanId: string, input: EstateUpdateDto) {
    return {
      estatePlanId,
      updatedFields: Object.keys(input),
      status: "draft_in_progress_locally",
    };
  }

  validateEstateReadiness(estatePlanId: string) {
    const estatePlan = this.getMockEstatePlan(estatePlanId);
    const summary = calculateEstateReadiness(estatePlan);

    return {
      isReady: summary.readinessScore >= 80 && summary.missingItems.length === 0,
      missingItems: summary.missingItems,
      score: summary.readinessScore,
    };
  }

  generateEstateSummary(estatePlanId: string) {
    const estatePlan = this.getMockEstatePlan(estatePlanId);
    return calculateEstateReadiness(estatePlan);
  }

  generateEstateIntakePdf(estatePlanId: string) {
    const summary = this.generateEstateSummary(estatePlanId);
    return this.documentsService.buildEstateIntakePdf({
      fileName: `estate-intake-${estatePlanId}.pdf`,
      request: {
        title: "Kahf Wealth Estate Intake Summary",
        sections: [
          {
            heading: "Readiness",
            body: [
              `Readiness score: ${summary.readinessScore}`,
              ...summary.missingItems,
            ],
          },
        ],
      },
    });
  }

  submitEstateForAttorneyReview(estatePlanId: string) {
    const estatePlan = this.getMockEstatePlan(estatePlanId);
    const summary = calculateEstateReadiness(estatePlan);
    const userProfile: UserProfile = {
      userId: "demo-user",
      fullName: "Kahf Wealth Member",
      language: "en",
    };
    const normalizedPayload = buildEstateHandoffPayload({
      estatePlan,
      userProfile,
      summary,
    });

    return this.isaacsIntegrationAdapter.submit(normalizedPayload);
  }

  getEstateHandoffStatus(estatePlanId: string) {
    return {
      estatePlanId,
      status: "under_review",
      timeline: [
        "ready_for_submission",
        "queued",
        "sent",
        "received",
        "under_review",
      ],
    };
  }

  private getMockEstatePlan(estatePlanId: string): EstatePlan {
    return {
      id: estatePlanId,
      userId: "demo-user",
      status: "ready_for_submission",
      maritalStatus: "married",
      jurisdiction: "South Africa",
      familyMembers: [
        {
          id: "fm-1",
          relationship: "spouse",
          fullName: "Zaynab",
          alive: true,
        },
        {
          id: "fm-2",
          relationship: "child",
          fullName: "Maryam",
          alive: true,
          dependent: true,
        },
      ],
      executors: [
        {
          id: "ex-1",
          relationship: "executor",
          fullName: "Abdullah Trustee",
          alive: true,
        },
      ],
      guardians: [
        {
          id: "gu-1",
          relationship: "guardian",
          fullName: "Khadijah Guardian",
          alive: true,
        },
      ],
      assets: [
        {
          id: "asset-1",
          label: "Primary residence",
          value: { amount: 120000, currency: "USD" },
          ownershipType: "individual",
        },
      ],
      liabilities: [
        {
          id: "liability-1",
          label: "Home financing settlement estimate",
          amount: { amount: 40000, currency: "USD" },
          secured: true,
        },
      ],
      burialPreferences: "Islamic burial as soon as reasonably possible.",
      bequestNotes: "Subject to attorney review and jurisdiction rules.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
