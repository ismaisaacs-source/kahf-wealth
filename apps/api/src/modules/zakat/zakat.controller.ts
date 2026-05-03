import { Body, Controller, Post } from "@nestjs/common";
import type { ZakatCalculationInput } from "@kahf/domain";
import { ZakatService } from "./zakat.service";

@Controller("zakat")
export class ZakatController {
  constructor(private readonly zakatService: ZakatService) {}

  @Post("calculate")
  calculate(@Body() input: ZakatCalculationInput) {
    return this.zakatService.calculateAndSave("demo-user", input);
  }
}
