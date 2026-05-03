import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import type { EstateCreateDto, EstateUpdateDto } from "@kahf/domain";
import { EstateService } from "./estate.service";

@Controller("estate")
export class EstateController {
  constructor(private readonly estateService: EstateService) {}

  @Post()
  createEstatePlan(@Body() input: EstateCreateDto) {
    return this.estateService.createEstatePlan(input);
  }

  @Put(":estatePlanId")
  updateEstatePlan(
    @Param("estatePlanId") estatePlanId: string,
    @Body() input: EstateUpdateDto,
  ) {
    return this.estateService.updateEstatePlan(estatePlanId, input);
  }

  @Get(":estatePlanId/readiness")
  validateEstateReadiness(@Param("estatePlanId") estatePlanId: string) {
    return this.estateService.validateEstateReadiness(estatePlanId);
  }

  @Get(":estatePlanId/summary")
  generateEstateSummary(@Param("estatePlanId") estatePlanId: string) {
    return this.estateService.generateEstateSummary(estatePlanId);
  }

  @Post(":estatePlanId/pdf")
  generateEstateIntakePdf(@Param("estatePlanId") estatePlanId: string) {
    return this.estateService.generateEstateIntakePdf(estatePlanId);
  }

  @Post(":estatePlanId/submit")
  submitEstateForAttorneyReview(@Param("estatePlanId") estatePlanId: string) {
    return this.estateService.submitEstateForAttorneyReview(estatePlanId);
  }

  @Get(":estatePlanId/handoff-status")
  getEstateHandoffStatus(@Param("estatePlanId") estatePlanId: string) {
    return this.estateService.getEstateHandoffStatus(estatePlanId);
  }
}
