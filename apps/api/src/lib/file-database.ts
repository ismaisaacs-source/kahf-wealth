import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { EstatePlan, SavedZakatReport, SubscriptionPlan } from "@kahf/domain";

export interface PersistedUser {
  uid: string;
  email: string;
  fullName: string;
  language: "en" | "ar" | "ur";
  plan: SubscriptionPlan;
  createdAt: string;
  lastSeenAt: string;
}

interface PersistedDatabase {
  users: PersistedUser[];
  zakatReports: SavedZakatReport[];
  screeningWatchlist: Array<{
    userId: string;
    ticker: string;
    addedAt: string;
  }>;
  screeningPortfolio: Array<{
    userId: string;
    ticker: string;
    units: number;
    updatedAt: string;
  }>;
  screeningActivity: Array<{
    id: string;
    userId: string;
    ticker: string;
    type:
      | "watchlist_added"
      | "watchlist_removed"
      | "portfolio_added"
      | "portfolio_updated"
      | "portfolio_removed";
    occurredAt: string;
    note: string;
  }>;
  estatePlans: EstatePlan[];
}

const databasePath = resolveDatabasePath();

function resolveDatabasePath() {
  const rootPath = resolve(process.cwd(), "apps/api/data/dev-db.json");
  if (existsSync(rootPath)) {
    return rootPath;
  }

  return resolve(process.cwd(), "data/dev-db.json");
}

export async function readDatabase(): Promise<PersistedDatabase> {
  try {
    const content = await readFile(databasePath, "utf8");
    const parsed = JSON.parse(content) as Partial<PersistedDatabase>;
    return {
      users: parsed.users ?? [],
      zakatReports: parsed.zakatReports ?? [],
      screeningWatchlist: parsed.screeningWatchlist ?? [],
      screeningPortfolio: parsed.screeningPortfolio ?? [],
      screeningActivity: parsed.screeningActivity ?? [],
      estatePlans: parsed.estatePlans ?? [],
    };
  } catch {
    const initial: PersistedDatabase = {
      users: [],
      zakatReports: [],
      screeningWatchlist: [],
      screeningPortfolio: [],
      screeningActivity: [],
      estatePlans: [],
    };
    await writeDatabase(initial);
    return initial;
  }
}

export async function writeDatabase(database: PersistedDatabase) {
  await mkdir(dirname(databasePath), { recursive: true });
  await writeFile(databasePath, JSON.stringify(database, null, 2), "utf8");
}
