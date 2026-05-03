import { Body, Controller, Get, Post } from "@nestjs/common";
import type { ScreeningInput } from "@kahf/domain";
import { ScreeningService } from "./screening.service";

@Controller("screening")
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @Post("classify")
  classify(@Body() input: ScreeningInput) {
    return this.screeningService.classify(input);
  }

  @Get("watchlist")
  getWatchlist() {
    return this.screeningService.getWatchlist();
  }
}
