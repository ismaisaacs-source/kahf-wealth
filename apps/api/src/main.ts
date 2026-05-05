import "./lib/load-env";
import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import type { EstateFoundationInput, ZakatCalculationInput } from "@kahf/domain";
import { methodologyVersions, trustCopy } from "@kahf/config";
import { RuntimeEstateService } from "./modules/estate/runtime-estate.service";
import { ProfileService } from "./modules/profile/profile.service";
import { ScreeningService } from "./modules/screening/screening.service";
import { SubscriptionsService } from "./modules/subscriptions/subscriptions.service";
import { ZakatService } from "./modules/zakat/zakat.service";
import { requireAuth } from "./lib/require-auth";

const app = express();
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
const estateService = new RuntimeEstateService();
const profileService = new ProfileService();
const screeningService = new ScreeningService();
const subscriptionsService = new SubscriptionsService();
const zakatService = new ZakatService();
const allowedCorsOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "https://kahf.isaacslegal.co.za",
]);

const zakatSchema: z.ZodType<ZakatCalculationInput> = z.object({
  assets: z.array(
    z.object({
      label: z.string().min(1),
      amount: z.number().min(0),
      category: z.string().min(1),
      zakatablePortion: z.number().min(0).max(1).optional(),
    }),
  ),
  liabilities: z.array(
    z.object({
      label: z.string().min(1),
      amount: z.number().min(0),
      dueWithinYear: z.boolean(),
    }),
  ),
  nisab: z.number().min(0),
  currency: z.string().length(3),
});

const estateFoundationSchema: z.ZodType<EstateFoundationInput> = z.object({
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  jurisdiction: z.string().optional(),
  spouseName: z.string().optional(),
  childrenCount: z.number().min(0),
  executorName: z.string().optional(),
  guardianName: z.string().optional(),
  assetEstimate: z.number().min(0),
  liabilityEstimate: z.number().min(0),
  burialPreferences: z.string().optional(),
  bequestNotes: z.string().optional(),
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedCorsOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
  }),
);
app.use(express.json());
app.use("/exports", express.static(resolveExportsDirectory()));
app.get("/", (_request, response) => {
  response.send(`
    <html>
      <head><title>Kahf Wealth</title></head>
      <body style="font-family: Arial; padding: 40px;">
        <h1>Kahf Wealth</h1>
        <p>The Kahf Wealth API is live.</p>
        <p><a href="/api/health">Check API health</a></p>
      </body>
    </html>
  `);
});
app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "kahf-api" });
});
app.get("/api/users", (_request, response) => {
  response.json([
    {
      id: "user_001",
      email: "ismaeel@isaacslegal.co.za",
      createdAt: "2026-05-05",
      subscription: "admin",
    },
  ]);
});

app.post("/api/auth/session", async (request, response) => {
  try {
    const body = z.object({ idToken: z.string().min(1) }).parse(request.body);
    const user = await (await import("./lib/firebase-auth")).resolveFirebaseUser(body.idToken);
    const profile = await profileService.upsertFromAuth(user);
    const subscription = await subscriptionsService.getCurrentSubscription(user.uid);

    response.json({ user, profile, subscription });
  } catch (error) {
    response.status(401).json({
      code: "AUTH_FAILED",
      message: error instanceof Error ? error.message : "Unable to authenticate.",
    });
  }
});

app.get("/api/profile", async (request, response) => {
  try {
    const user = await requireAuth(request);
    const profile = await profileService.upsertFromAuth(user);
    response.json(profile);
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/subscriptions/current", async (request, response) => {
  try {
    const user = await requireAuth(request);
    const subscription = await subscriptionsService.getCurrentSubscription(user.uid);
    response.json(subscription);
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/zakat/history", async (request, response) => {
  try {
    const user = await requireAuth(request);
    const history = await zakatService.getHistory(user.uid);
    response.json(history);
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/screening/search", async (request, response) => {
  try {
    await requireAuth(request);
    const query = z.string().optional().parse(request.query.q);
    response.json(screeningService.search(query ?? ""));
  } catch (error) {
    response.status(400).json({
      code: "SCREENING_SEARCH_INVALID",
      message: error instanceof Error ? error.message : "Invalid screening search.",
    });
  }
});

app.get("/api/screening/assets/:ticker", async (request, response) => {
  try {
    await requireAuth(request);
    response.json(screeningService.getAssetDetail(request.params.ticker));
  } catch (error) {
    response.status(404).json({
      code: "SCREENING_ASSET_NOT_FOUND",
      message: error instanceof Error ? error.message : "Screening asset not found.",
    });
  }
});

app.get("/api/screening/watchlist", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await screeningService.getWatchlist(user.uid));
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/screening/portfolio", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await screeningService.getPortfolio(user.uid));
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/screening/portfolio/report", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await screeningService.getPortfolioReport(user.uid));
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.post("/api/screening/portfolio/pdf-pack", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.status(201).json(await screeningService.generatePortfolioPdfPack(user.uid));
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/screening/activity", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await screeningService.getActivity(user.uid));
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/methodology", async (request, response) => {
  try {
    await requireAuth(request);
    response.json({
      versions: methodologyVersions,
      notes: [
        {
          versionId: "screening-v1",
          title: "Advisory note",
          content:
            "Screening outputs are planning support, not a universal fatwa. Review sector flags, ratio thresholds, and methodology dates before acting.",
        },
        {
          versionId: "zakat-v1",
          title: "Calculation note",
          content:
            "Zakat reports assume the entered balances are current and that short-term liabilities are genuinely deductible within the coming lunar cycle.",
        },
      ],
      disclaimers: trustCopy,
    });
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/estate/plan", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await estateService.getPlan(user.uid));
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.get("/api/estate/readiness", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await estateService.getReadiness(user.uid));
  } catch (error) {
    response.status(401).json({
      code: "UNAUTHORIZED",
      message: error instanceof Error ? error.message : "Unauthorized.",
    });
  }
});

app.post("/api/screening/watchlist", async (request, response) => {
  try {
    const user = await requireAuth(request);
    const body = z.object({ ticker: z.string().min(1) }).parse(request.body);
    response.status(201).json(await screeningService.addToWatchlist(user.uid, body.ticker));
  } catch (error) {
    response.status(400).json({
      code: "SCREENING_WATCHLIST_INVALID",
      message: error instanceof Error ? error.message : "Invalid watchlist request.",
    });
  }
});

app.put("/api/screening/portfolio/:ticker", async (request, response) => {
  try {
    const user = await requireAuth(request);
    const body = z.object({ units: z.number().positive() }).parse(request.body);
    response.json(
      await screeningService.savePortfolioHolding(user.uid, request.params.ticker, body.units),
    );
  } catch (error) {
    response.status(400).json({
      code: "SCREENING_PORTFOLIO_INVALID",
      message: error instanceof Error ? error.message : "Invalid portfolio request.",
    });
  }
});

app.put("/api/estate/plan", async (request, response) => {
  try {
    const user = await requireAuth(request);
    const input = estateFoundationSchema.parse(request.body);
    response.json(await estateService.saveFoundation(user.uid, input));
  } catch (error) {
    response.status(400).json({
      code: "ESTATE_PLAN_INVALID",
      message: error instanceof Error ? error.message : "Invalid estate plan payload.",
    });
  }
});

app.delete("/api/screening/watchlist/:ticker", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await screeningService.removeFromWatchlist(user.uid, request.params.ticker));
  } catch (error) {
    response.status(400).json({
      code: "SCREENING_WATCHLIST_INVALID",
      message: error instanceof Error ? error.message : "Invalid watchlist request.",
    });
  }
});

app.delete("/api/screening/portfolio/:ticker", async (request, response) => {
  try {
    const user = await requireAuth(request);
    response.json(await screeningService.removePortfolioHolding(user.uid, request.params.ticker));
  } catch (error) {
    response.status(400).json({
      code: "SCREENING_PORTFOLIO_INVALID",
      message: error instanceof Error ? error.message : "Invalid portfolio request.",
    });
  }
});

app.post("/api/zakat/calculate", async (request, response) => {
  try {
    const user = await requireAuth(request);
    const input = zakatSchema.parse(request.body);
    const report = await zakatService.calculateAndSave(user.uid, input);
    response.status(201).json(report);
  } catch (error) {
    response.status(400).json({
      code: "ZAKAT_REQUEST_INVALID",
      message: error instanceof Error ? error.message : "Invalid zakat request.",
    });
  }
});

app.listen(port, () => {
  console.log(`Kahf Wealth API running on http://localhost:${port}/api`);
});

function resolveExportsDirectory() {
  if (existsSync(resolve(process.cwd(), "src/main.ts")) || existsSync(resolve(process.cwd(), "dist/main.js"))) {
    return resolve(process.cwd(), "data/exports");
  }

  return resolve(process.cwd(), "apps/api/data/exports");
}
