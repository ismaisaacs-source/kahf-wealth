import { Injectable } from "@nestjs/common";
import type {
  EstateHandoffSubmissionResult,
  NormalizedEstateHandoffPayload,
} from "@kahf/domain";

@Injectable()
export class IsaacsIntegrationAdapter {
  submit(
    payload: NormalizedEstateHandoffPayload,
  ): EstateHandoffSubmissionResult & { normalizedPayload: NormalizedEstateHandoffPayload } {
    return {
      status: "queued",
      reference: `ISAACS-${payload.estatePlanId}`,
      normalizedPayload: payload,
    };
  }
}
