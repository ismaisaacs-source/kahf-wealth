import { paidServices, subscriptionPlans } from "@kahf/config";
import { readDatabase } from "../../lib/file-database";

export class SubscriptionsService {
  async getCurrentSubscription(userId: string) {
    const database = await readDatabase();
    const user = database.users.find((entry) => entry.uid === userId);
    const plan = user?.plan ?? "free";

    return {
      plan,
      features: subscriptionPlans[plan],
      optionalServices: paidServices,
    };
  }
}
