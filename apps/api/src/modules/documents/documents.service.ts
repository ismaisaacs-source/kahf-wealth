import { Injectable } from "@nestjs/common";
import type { EstateSummaryDocument, PdfRenderRequest } from "@kahf/domain";

@Injectable()
export class DocumentsService {
  renderPdf(request: PdfRenderRequest) {
    return {
      fileName: `${slugify(request.title)}.pdf`,
      template: "server-side-pdf",
      request,
    };
  }

  buildEstateIntakePdf(summary: EstateSummaryDocument) {
    return this.renderPdf(summary.request);
  }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
