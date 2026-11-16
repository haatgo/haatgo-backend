# Local implementation evidence

This repository contains a running local implementation. The execution list uses
`in_progress` for broad tasks with implemented code whose full acceptance is still
pending. A passing journey does not certify every screen or release requirement.
Tests use fixed dummy OTP and simulated providers, with OpenStreetMap views.

## Reproducible checks

Run `npm run typecheck` and `npm run test:integration` in this repository.
Run `npm run test:e2e` with the local prerequisites documented in README.md.
The recorded results are in `docs/evidence/verify-*.log`; the workspace aggregate
is `04_Execution/verification-results.json` outside this independent repository.
This external aggregate is optional and is never imported by application code.

## Implemented and exercised

`src/app.ts`, `src/service.ts`, `src/domain.ts`, `src/store.ts` implement the local
API inventory. `tests/integration` covers OTP/session/ownership, carts and quotes,
idempotency, catalogue relationships and eligibility, dispatch, shopping and COD,
private proof validation, discounts, finance/refunds, projection privacy and reports.
`tests/e2e` runs real MongoDB replica-set transactions and backup/restore integrity.
`src/contracts.ts` and `contracts/openapi.json` describe core requests and entities.
The route inventory test checks registration; it is not a success-schema fixture
for every operation. Endpoint SCHEMA/CONTRACT tasks remain in progress accordingly.

## Remaining acceptance

Complete response/error schemas and operation examples; real Redis/BullMQ outage
verification; migration upgrades; collection-specific scalable queries/load targets;
provider adapters if later requested; production policy sign-off, off-host encrypted
backup retention/restore drills, isolated clean checkout and release acceptance.
Local restore coverage does not certify production recovery objectives.

## Local launcher recovery

The launcher watches only src and worker TypeScript, excluding generated copies.
`docs/evidence/verify-local-watcher.log` verifies documentation updates leave the API
process running and source updates restart it with Mongo-backed readiness restored.
This replaces broad Node watch behavior that briefly interrupted a device rerun.


## Catalogue asset update

Cloudinary is the explicitly authorized real provider for public catalogue media;
OTP, payments and notifications remain dummy. Products and categories carry public
image/icon URLs and optional managed asset references. Every client renders its own
image components and keeps its own dependencies. The backend owns upload validation,
normalization, RBAC, audit and folder selection. Private receipts are separate.

The new backend media integration suite covers permission denial, invalid content,
size/scope validation, concurrent edits during upload, correct reference kinds,
provider payload and safe failure. Admin integration tests cover preview/reference
binding and keeping an existing image after failure. The live admin browser journey
creates and uploads both category and product, then verifies actual image delivery
on the customer website. The customer repo separately tests CDN failure recovery.

## Render web-service keep-alive

Render web services start a ten-minute timer that requests the public
`/health/live` endpoint with a ten-second timeout. The timer is disabled outside
Render web services, logs non-2xx/network failures, and is cleared during shutdown.
`tests/render-keep-alive.test.ts` covers environment gating, endpoint selection,
failure reporting and timer cleanup. Hosted deployment verification remains pending.
This is only a free-tier availability workaround; use a paid Render instance for
production rather than relying on self-pings.
