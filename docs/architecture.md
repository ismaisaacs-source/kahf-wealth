# Kahf Wealth Architecture Summary

## Repository Inspection Summary

- The workspace began empty with no existing source files, manifests, or infrastructure definitions.
- No current routes, data models, helpers, or service contracts existed to extend safely.
- Because there was no inherited codebase to preserve, the safest implementation path was a conservative monorepo scaffold with shared domain contracts and isolated business engines.

## Assumptions

- The eventual production stack will use a standard Node.js toolchain even though it was not present in the current shell PATH.
- Firebase Authentication, MongoDB, Redis, FCM, object storage, and PDF rendering will be connected in later infrastructure work.
- The downstream ISAACS Will Generator API contract is not yet available, so a normalized internal payload and a mock adapter are the safest current boundary.

## Risks And Unknowns

- Real authentication flows, secrets, persistence adapters, and push infrastructure remain integration tasks.
- Jurisdiction-specific estate and inheritance treatment varies and must remain advisory until reviewed by legal counsel.
- Investment screening quality depends on the future market-data provider contract and data freshness guarantees.
- PDF generation templates and secure storage access controls need production implementation details.

## Proposed Implementation Order

1. Shared domain models, trust copy, feature flags, and pure business logic.
2. API modules for zakat, screening, estate planning, methodology, subscriptions, notifications, documents, and admin.
3. Mobile MVP shell with premium visual system and focused screen flows.
4. Admin dashboard scaffold for operations and methodology governance.
5. Tests for core engines and adapter payload normalization.
6. Infrastructure adapters, persistence, auth, notifications, and deployment hardening.

## Folder Structure

```text
apps/
  admin/
  api/
  mobile/
docs/
  architecture.md
packages/
  config/
  domain/
  finance/
```

## Schema And Data Model Overview

Shared entities currently cover:

- user and profile primitives
- preferences and notification settings
- zakat assets, liabilities, profiles, hawl cycles, and reports
- watchlists, holdings, portfolios, compliance snapshots, and purification records
- estate plans, family members, heirs, estate assets, estate liabilities, summaries, and handoff statuses
- documents, subscriptions, audit logs, methodology notes, and admin users

## API And Module Overview

- `/profile`: current profile snapshot
- `/zakat/calculate`: pure calculation engine endpoint
- `/screening/classify` and `/screening/watchlist`: explainable screening and watchlist stub
- `/estate`: create, update, readiness, summary, PDF, submission, and handoff status
- `/documents/render-pdf`: server-side PDF request envelope
- `/notifications`: notifications center seed
- `/subscriptions/current`: centralized plan and paid service config
- `/methodology`: dated methodology and trust content
- `/admin/overview`: internal operational summary

## ISAACS Handoff Integration Design

The integration boundary is intentionally layered:

1. Mobile intake gathers user-facing estate information.
2. API validates readiness and builds a summary.
3. `buildEstateHandoffPayload` normalizes estate data into an internal legal-intake contract.
4. `IsaacsIntegrationAdapter` maps the normalized payload to the downstream drafting system.

This preserves separation of concerns so Kahf Wealth remains a planning and handoff product, not a drafting engine.

## PDF Generation Approach

- Build structured PDF render requests from API services.
- Use server-side rendering with object storage-backed file persistence in production.
- Keep mobile clients limited to requesting and viewing generated artifacts, not composing legal documents on-device.

## Design System Plan

- Deep green primary palette with warm gold accents and ivory backgrounds
- High-contrast typography and spacious card layouts
- Calm, premium dashboards with concise trust language
- Multilingual foundation for English, Arabic, and Urdu
- Clear premium gating through centralized config rather than scattered screen logic

## Deployment Notes

- Mobile: Expo Application Services for iOS and Android
- API: NestJS on Railway, Render, Fly.io, or AWS with MongoDB and Redis
- Admin: Next.js on Vercel or a separate Node host
- File storage: S3-compatible object store for reports and uploads
- Notifications: Firebase Cloud Messaging plus scheduled jobs backed by Redis
