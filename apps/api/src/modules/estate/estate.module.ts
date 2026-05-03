import { Module } from "@nestjs/common";
import { DocumentsModule } from "../documents/documents.module";
import { EstateController } from "./estate.controller";
import { EstateService } from "./estate.service";
import { IsaacsIntegrationAdapter } from "./isaacs-integration.adapter";

@Module({
  imports: [DocumentsModule],
  controllers: [EstateController],
  providers: [EstateService, IsaacsIntegrationAdapter],
})
export class EstateModule {}
