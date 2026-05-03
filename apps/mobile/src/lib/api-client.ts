import type {
  AuthSessionResponse,
  EstateFoundationInput,
  EstatePlan,
  EstateReadinessResult,
  MethodologyResponse,
  SavedZakatReport,
  ScreeningActivityResponse,
  ScreeningAssetDetail,
  ScreeningPortfolioPdfPackResponse,
  ScreeningPortfolioResponse,
  ScreeningPortfolioReportResponse,
  ScreeningSearchResponse,
  ScreeningWatchlistResponse,
  ZakatCalculationInput,
  ZakatHistoryResponse,
} from "@kahf/domain";
import { appEnv } from "../config/env";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${appEnv.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  createSession(idToken: string) {
    return request<AuthSessionResponse>("/auth/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },
  getProfile(idToken: string) {
    return request<AuthSessionResponse["profile"]>("/profile", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getSubscription(idToken: string) {
    return request<AuthSessionResponse["subscription"]>("/subscriptions/current", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getZakatHistory(idToken: string) {
    return request<ZakatHistoryResponse>("/zakat/history", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  saveZakatCalculation(idToken: string, input: ZakatCalculationInput) {
    return request<SavedZakatReport>("/zakat/calculate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(input),
    });
  },
  searchScreeningAssets(idToken: string, query: string) {
    const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
    return request<ScreeningSearchResponse>(`/screening/search${suffix}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getScreeningAsset(idToken: string, ticker: string) {
    return request<ScreeningAssetDetail>(`/screening/assets/${ticker}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getScreeningWatchlist(idToken: string) {
    return request<ScreeningWatchlistResponse>("/screening/watchlist", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  addToScreeningWatchlist(idToken: string, ticker: string) {
    return request<ScreeningWatchlistResponse>("/screening/watchlist", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ticker }),
    });
  },
  removeFromScreeningWatchlist(idToken: string, ticker: string) {
    return request<ScreeningWatchlistResponse>(`/screening/watchlist/${ticker}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getScreeningPortfolio(idToken: string) {
    return request<ScreeningPortfolioResponse>("/screening/portfolio", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getScreeningPortfolioReport(idToken: string) {
    return request<ScreeningPortfolioReportResponse>("/screening/portfolio/report", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  generateScreeningPortfolioPdfPack(idToken: string) {
    return request<ScreeningPortfolioPdfPackResponse>("/screening/portfolio/pdf-pack", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getScreeningActivity(idToken: string) {
    return request<ScreeningActivityResponse>("/screening/activity", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  saveScreeningPortfolioHolding(idToken: string, ticker: string, units: number) {
    return request<ScreeningPortfolioResponse>(`/screening/portfolio/${ticker}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ units }),
    });
  },
  removeScreeningPortfolioHolding(idToken: string, ticker: string) {
    return request<ScreeningPortfolioResponse>(`/screening/portfolio/${ticker}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getMethodology(idToken: string) {
    return request<MethodologyResponse>("/methodology", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  getEstatePlan(idToken: string) {
    return request<EstatePlan>("/estate/plan", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
  saveEstatePlan(idToken: string, input: EstateFoundationInput) {
    return request<EstatePlan>("/estate/plan", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(input),
    });
  },
  getEstateReadiness(idToken: string) {
    return request<EstateReadinessResult>("/estate/readiness", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  },
};
