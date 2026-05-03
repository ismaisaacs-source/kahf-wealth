import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminService {
  getOverview() {
    return {
      users: 128,
      premiumSubscribers: 31,
      queuedEstateHandoffs: 4,
      failedEstateHandoffs: 1,
      methodologyVersion: "2026.04",
    };
  }
}
