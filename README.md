# Kahf Wealth

Kahf Wealth is a production-minded MVP scaffold for a premium Islamic finance platform spanning:

- `apps/mobile`: Expo + React Native mobile application for iOS and Android
- `apps/api`: NestJS backend for authentication-adjacent domain services, zakat, screening, estate planning, documents, subscriptions, and admin operations
- `apps/admin`: Next.js admin dashboard for methodology, handoff monitoring, subscriptions, and audit visibility
- `packages/domain`: Shared types, enums, entities, DTO-aligned contracts, and status models
- `packages/finance`: Pure financial and estate-planning engines with focused tests
- `packages/config`: Centralized plans, feature flags, trust language, and methodology metadata

## Architecture

Kahf Wealth intentionally separates consumer intake from downstream legal drafting:

1. Mobile app collects estate planning information and presents planning guidance.
2. API validates data, computes readiness, builds summaries, and creates lawyer-ready intake artifacts.
3. Estate handoff adapter normalizes internal data into a stable legal-intake payload.
4. ISAACS integration adapter maps that payload to the downstream professional drafting contract.

This avoids embedding the ISAACS Will Generator drafting workflow inside the consumer app.

## Product Pillars

- Zakat calculation and annual tracking
- Explainable halal investment screening
- Islamic estate-planning intake, readiness, and attorney handoff

Supporting capabilities include prayer times, qibla, notifications, multilingual foundations, secure document vault patterns, premium gating, and trust-center content.

## Current State

This repository started empty, so the implementation emphasizes safe greenfield scaffolding:

- typed shared domain models
- pure business logic packages
- modular API boundaries
- premium mobile design system foundations
- practical admin scaffold
- explicit trust and disclaimer language

## Getting Started

This scaffold assumes a standard Node.js toolchain and package installation in a normal development environment.

```bash
npm install
npm run test
npm run dev:api
npm run dev:mobile
npm run dev:admin
```

## High-Value Test Targets

- zakat calculations
- screening outcomes and explanations
- estate readiness scoring
- heir summary generation
- normalized estate handoff payload generation

## Deployment Notes

- Mobile: Expo / EAS
- API: Railway, Render, Fly.io, or AWS
- Admin: Vercel or separate Node host
- Redis: caching, reminders, and submission retries
- MongoDB: primary application persistence
- Firebase Auth and FCM: authentication and push notifications
