import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import { useAuth } from "../state/auth-context";

export function useDashboardData() {
  const { getIdToken } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => apiClient.getProfile(await getIdToken()),
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => apiClient.getSubscription(await getIdToken()),
  });

  const zakatHistoryQuery = useQuery({
    queryKey: ["zakat-history"],
    queryFn: async () => apiClient.getZakatHistory(await getIdToken()),
  });

  return {
    profileQuery,
    subscriptionQuery,
    zakatHistoryQuery,
  };
}
