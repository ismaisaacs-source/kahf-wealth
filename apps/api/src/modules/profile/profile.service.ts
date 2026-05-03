import type { AuthenticatedUser } from "@kahf/domain";
import { readDatabase, writeDatabase } from "../../lib/file-database";

export class ProfileService {
  async upsertFromAuth(user: AuthenticatedUser) {
    const database = await readDatabase();
    const existing = database.users.find((entry) => entry.uid === user.uid);
    const timestamp = new Date().toISOString();

    if (existing) {
      existing.email = user.email;
      existing.fullName = user.displayName ?? existing.fullName;
      existing.lastSeenAt = timestamp;
    } else {
      database.users.push({
        uid: user.uid,
        email: user.email,
        fullName: user.displayName ?? user.email.split("@")[0] ?? "Kahf Member",
        language: "en",
        plan: "premium",
        createdAt: timestamp,
        lastSeenAt: timestamp,
      });
    }

    await writeDatabase(database);
    return this.getCurrentProfile(user.uid);
  }

  async getCurrentProfile(userId: string) {
    const database = await readDatabase();
    const user = database.users.find((entry) => entry.uid === userId);

    if (!user) {
      throw new Error("User profile not found.");
    }

    return {
      userId: user.uid,
      fullName: user.fullName,
      language: user.language,
      plan: user.plan,
      email: user.email,
    };
  }
}
