import { Controller, Get } from "@nestjs/common";
import { MethodologyService } from "./methodology.service";

@Controller("methodology")
export class MethodologyController {
  constructor(private readonly methodologyService: MethodologyService) {}

  @Get()
  listMethodology() {
    return this.methodologyService.listMethodology();
  }
}
