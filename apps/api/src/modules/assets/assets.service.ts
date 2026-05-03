import { Injectable } from "@nestjs/common";

@Injectable()
export class AssetsService {
  listAssets() {
    return [
      { id: "asset-1", category: "cash", label: "Emergency fund", amount: 9000 },
      { id: "asset-2", category: "stocks", label: "Brokerage", amount: 12000 },
    ];
  }
}
