import { Body, Controller, Post } from "@nestjs/common";
import type { PdfRenderRequest } from "@kahf/domain";
import { DocumentsService } from "./documents.service";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("render-pdf")
  renderPdf(@Body() request: PdfRenderRequest) {
    return this.documentsService.renderPdf(request);
  }
}
