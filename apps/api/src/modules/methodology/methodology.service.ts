import { Injectable } from "@nestjs/common";
import { methodologyVersions, trustCopy } from "@kahf/config";

@Injectable()
export class MethodologyService {
  listMethodology() {
    return {
      versions: methodologyVersions,
      notes: [
        {
          versionId: "screening-v1",
          title: "Advisory note",
          content:
            "Methodology notes should remain dated, reviewable, and auditable by internal staff.",
        },
      ],
      disclaimers: trustCopy,
    };
  }
}
