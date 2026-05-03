import type {
  SavedZakatReport,
  ZakatCalculationInput,
  ZakatHistoryResponse,
} from "@kahf/domain";
import { calculateZakat } from "@kahf/finance";
import { readDatabase, writeDatabase } from "../../lib/file-database";

export class ZakatService {
  async calculateAndSave(userId: string, input: ZakatCalculationInput) {
    const result = calculateZakat(input);
    const report: SavedZakatReport = {
      id: `zakat-${Date.now()}`,
      userId,
      generatedAt: new Date().toISOString(),
      input,
      ...result,
    };
    const database = await readDatabase();
    database.zakatReports.unshift(report);
    await writeDatabase(database);
    return report;
  }

  async getHistory(userId: string): Promise<ZakatHistoryResponse> {
    const database = await readDatabase();
    const history = database.zakatReports.filter((report) => report.userId === userId);

    return {
      latest: history[0],
      history,
    };
  }
}
