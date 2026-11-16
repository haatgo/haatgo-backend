# Granular execution list

Task data: `tasks.json`. Update status/evidence there, then run the local execution renderer.
Statuses: todo, in_progress, blocked, done. Each task is one reviewable change; split work that exceeds one developer day.
A done task requires its stated acceptance and a linked evidence artifact. No product work is pre-marked complete.

## BE-BOOT — Bootstrap independent Express TypeScript repository

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: W-CONTRACT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Local package.json, exact lockfile, Node/runtime pin, tsconfig and build entry points.
- Acceptance: Clean checkout installs with npm ci and builds without parent/sibling files.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ENV — Validate backend configuration and secrets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Typed environment parser, .env.example and dev/staging/prod boundaries.
- Acceptance: Missing critical configuration fails startup; secrets redacted; no client bundle exposes secrets.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-DB — Connect Mongo replica set and migration runner

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Backend-owned local replica-set setup, migration command and database adapter.
- Acceptance: Transaction commit/rollback demonstrated on fixture DB; migration upgrade/retry tested.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-REDIS — Connect private Redis with failure policies

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Redis connection/ACL/namespace configuration and readiness health.
- Acceptance: Limiter fails closed; catalogue may use Mongo; queue outage leaves outbox pending.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-HTTP — Implement common validation and HTTP envelopes

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Express middleware, auth context, validation/error mapper and request IDs.
- Acceptance: Malformed requests rejected consistently; response includes requestId; logs redact PII.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-OPENAPI — Establish OpenAPI validation and common schema conventions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: OpenAPI document/tooling, security schemes, common envelopes, errors, pagination and example conventions.
- Acceptance: Schema lint validation passes; per-operation request/response work is tracked by BE-EP-* tasks; extend snapshot allowlist when approved OpenAPI artifacts exist.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EVENTS — Freeze event schemas and evolution policy

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Versioned event payload schemas and bounded event-name registry.
- Acceptance: seq/eventId semantics align with TAD 05; invalid payload rejected; no addresses in broad rooms.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-OUTBOX — Implement transactional outbox publisher

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Mongo event persistence, deterministic BullMQ enqueue, retries and recovery.
- Acceptance: Crash between commit/enqueue/ack and Redis restart cannot duplicate a domain side effect.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-SOCKET — Authorize Socket.IO rooms and state recovery

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT, BE-OUTBOX.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Room authorization, token lifecycle and snapshot recovery routes.
- Acceptance: Unrelated actor denied; duplicate/reordered events tolerated; reconnect GET restores current state.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-PUSH — Implement device registration and FCM adapter

- Status: **todo**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT, BE-OUTBOX.
- Requirement(s): cross-cutting.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Private device registry, invalid-token cleanup and idempotent notification worker.
- Acceptance: Milestone job retries do not mutate order twice; deep-link payload contains safe identifiers only.
- Evidence: pending.

## BE-AUTH-MODEL — Model OTP, rotating sessions and admin RBAC

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-HTTP, BE-DB, BE-REDIS, W-DEC-12, W-DEC-20.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: OTP hash/TTL/attempts, customer/partner/admin scopes, admin session and rotation.
- Acceptance: Model/index/policy review demonstrates invariants: Expired/invalid OTP, shared throttling, cross-role access, logout/revocation and refresh race denied safely.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-AUTH-API — Implement OTP, rotating sessions and admin RBAC

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-001-HANDLER, BE-EP-002-HANDLER, BE-EP-003-HANDLER, BE-EP-004-HANDLER, BE-EP-005-HANDLER, BE-EP-006-HANDLER, BE-EP-007-HANDLER, BE-EP-008-HANDLER, BE-EP-009-HANDLER, BE-EP-035-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for OTP, rotating sessions and admin RBAC.
- Acceptance: Expired/invalid OTP, shared throttling, cross-role access, logout/revocation and refresh race denied safely.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-AUTH-TEST — Verify OTP, rotating sessions and admin RBAC

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-AUTH-API, BE-EP-001-CONTRACT, BE-EP-002-CONTRACT, BE-EP-003-CONTRACT, BE-EP-004-CONTRACT, BE-EP-005-CONTRACT, BE-EP-006-CONTRACT, BE-EP-007-CONTRACT, BE-EP-008-CONTRACT, BE-EP-009-CONTRACT, BE-EP-035-CONTRACT.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for OTP, rotating sessions and admin RBAC.
- Acceptance: Expired/invalid OTP, shared throttling, cross-role access, logout/revocation and refresh race denied safely; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-GEO-MODEL — Model Markets, zones and serviceability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-HTTP, BE-DB, W-DEC-03, W-DEC-10, W-DEC-11.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: GeoJSON lng/lat and indexes, hours, primary market, fee rules and manual PIN fallback.
- Acceptance: Model/index/policy review demonstrates invariants: Closed/outside zone rejects quote; manual PIN works; in-progress snapshots unchanged by zone edit.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-GEO-API — Implement Markets, zones and serviceability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-GEO-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-010-HANDLER, BE-EP-063-HANDLER, BE-EP-064-HANDLER, BE-EP-065-HANDLER, BE-EP-066-HANDLER, BE-EP-067-HANDLER.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Markets, zones and serviceability.
- Acceptance: Closed/outside zone rejects quote; manual PIN works; in-progress snapshots unchanged by zone edit.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-GEO-TEST — Verify Markets, zones and serviceability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-GEO-API, BE-EP-010-CONTRACT, BE-EP-063-CONTRACT, BE-EP-064-CONTRACT, BE-EP-065-CONTRACT, BE-EP-066-CONTRACT, BE-EP-067-CONTRACT.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Markets, zones and serviceability.
- Acceptance: Closed/outside zone rejects quote; manual PIN works; in-progress snapshots unchanged by zone edit; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-CATALOG-MODEL — Model Catalogue, aliases, prices and orderability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-HTTP, BE-DB, BE-REDIS, BE-OUTBOX, W-DEC-02.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Product/category/version schema, search indexes, selling prices, archive and cache invalidation.
- Acceptance: Model/index/policy review demonstrates invariants: Aliases match; inactive SKU cannot be quoted; price edit invalidates browse cache after commit; historical snapshots stable.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-CATALOG-API — Implement Catalogue, aliases, prices and orderability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-011-HANDLER, BE-EP-012-HANDLER, BE-EP-013-HANDLER, BE-EP-014-HANDLER, BE-EP-015-HANDLER, BE-EP-058-HANDLER, BE-EP-059-HANDLER, BE-EP-060-HANDLER, BE-EP-061-HANDLER, BE-EP-062-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Catalogue, aliases, prices and orderability.
- Acceptance: Aliases match; inactive SKU cannot be quoted; price edit invalidates browse cache after commit; historical snapshots stable.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-CATALOG-TEST — Verify Catalogue, aliases, prices and orderability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-CATALOG-API, BE-EP-011-CONTRACT, BE-EP-012-CONTRACT, BE-EP-013-CONTRACT, BE-EP-014-CONTRACT, BE-EP-015-CONTRACT, BE-EP-058-CONTRACT, BE-EP-059-CONTRACT, BE-EP-060-CONTRACT, BE-EP-061-CONTRACT, BE-EP-062-CONTRACT.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Catalogue, aliases, prices and orderability.
- Acceptance: Aliases match; inactive SKU cannot be quoted; price edit invalidates browse cache after commit; historical snapshots stable; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ADDRESS-MODEL — Model Owned customer addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-HTTP, BE-AUTH-TEST.
- Requirement(s): CUS-004.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Address validation, ownership and soft-delete rules.
- Acceptance: Model/index/policy review demonstrates invariants: Customer cannot edit another address; PIN/fields validated; deleted address does not alter accepted order snapshot.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ADDRESS-API — Implement Owned customer addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ADDRESS-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-016-HANDLER, BE-EP-017-HANDLER, BE-EP-018-HANDLER, BE-EP-019-HANDLER.
- Requirement(s): CUS-004.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Owned customer addresses.
- Acceptance: Customer cannot edit another address; PIN/fields validated; deleted address does not alter accepted order snapshot.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ADDRESS-TEST — Verify Owned customer addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ADDRESS-API, BE-EP-016-CONTRACT, BE-EP-017-CONTRACT, BE-EP-018-CONTRACT, BE-EP-019-CONTRACT.
- Requirement(s): CUS-004.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Owned customer addresses.
- Acceptance: Customer cannot edit another address; PIN/fields validated; deleted address does not alter accepted order snapshot; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-CART-MODEL — Model Cross-device cart revisions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-CATALOG-TEST, BE-AUTH-TEST.
- Requirement(s): CUS-013, CUS-014.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Unique user cart, quantity constraints and expectedRevision conflict policy.
- Acceptance: Model/index/policy review demonstrates invariants: Web/mobile concurrent edits return conflict with current cart; no negative/max overflow or silent lost update.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-CART-API — Implement Cross-device cart revisions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-CART-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-020-HANDLER, BE-EP-021-HANDLER.
- Requirement(s): CUS-013, CUS-014.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Cross-device cart revisions.
- Acceptance: Web/mobile concurrent edits return conflict with current cart; no negative/max overflow or silent lost update.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-CART-TEST — Verify Cross-device cart revisions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-CART-API, BE-EP-020-CONTRACT, BE-EP-021-CONTRACT.
- Requirement(s): CUS-013, CUS-014.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Cross-device cart revisions.
- Acceptance: Web/mobile concurrent edits return conflict with current cart; no negative/max overflow or silent lost update; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-QUOTE-MODEL — Model Server quote and monetary invariants

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-CART-TEST, BE-GEO-TEST, BE-ADDRESS-TEST, W-DEC-02, W-DEC-06, W-DEC-10.
- Requirement(s): BE-002, CUS-020, CUS-022.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Paise-only snapshots, expiry, fees, cart revision and serviceability revalidation.
- Acceptance: Model/index/policy review demonstrates invariants: Tampered total ignored; expired/repriced quote returns reviewed replacement; total arithmetic includes all fee/discount lines.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-QUOTE-API — Implement Server quote and monetary invariants

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-QUOTE-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-022-HANDLER.
- Requirement(s): BE-002, CUS-020, CUS-022.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Server quote and monetary invariants.
- Acceptance: Tampered total ignored; expired/repriced quote returns reviewed replacement; total arithmetic includes all fee/discount lines.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-QUOTE-TEST — Verify Server quote and monetary invariants

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-QUOTE-API, BE-EP-022-CONTRACT.
- Requirement(s): BE-002, CUS-020, CUS-022.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Server quote and monetary invariants.
- Acceptance: Tampered total ignored; expired/repriced quote returns reviewed replacement; total arithmetic includes all fee/discount lines; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ORDER-MODEL — Model Idempotent order creation and state transitions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-QUOTE-TEST, BE-OUTBOX, W-DEC-03, W-DEC-04, W-DEC-14.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Actor/route/key uniqueness, request hash, versioned transition table and owner history/detail.
- Acceptance: Model/index/policy review demonstrates invariants: Same key/payload returns original; different payload conflicts; illegal transitions denied; transaction rolls back facts/event together.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ORDER-API — Implement Idempotent order creation and state transitions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ORDER-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-023-HANDLER, BE-EP-024-HANDLER, BE-EP-025-HANDLER, BE-EP-026-HANDLER.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Idempotent order creation and state transitions.
- Acceptance: Same key/payload returns original; different payload conflicts; illegal transitions denied; transaction rolls back facts/event together.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ORDER-TEST — Verify Idempotent order creation and state transitions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ORDER-API, BE-EP-023-CONTRACT, BE-EP-024-CONTRACT, BE-EP-025-CONTRACT, BE-EP-026-CONTRACT.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Idempotent order creation and state transitions.
- Acceptance: Same key/payload returns original; different payload conflicts; illegal transitions denied; transaction rolls back facts/event together; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-DISPATCH-MODEL — Model Atomic offers, availability and assignment

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST, BE-REDIS, BE-OUTBOX, W-DEC-04, W-DEC-09, W-DEC-10, W-DEC-15.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Approval/presence/geo filters, single active order constraints, expiry/reassignment and exception reasons.
- Acceptance: Model/index/policy review demonstrates invariants: Competing accepts yield one assignment; suspended/stale/offline partners denied; worker restart releases only guarded expired offer.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-DISPATCH-API — Implement Atomic offers, availability and assignment

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-036-HANDLER, BE-EP-037-HANDLER, BE-EP-038-HANDLER, BE-EP-039-HANDLER, BE-EP-040-HANDLER, BE-EP-041-HANDLER, BE-EP-042-HANDLER, BE-EP-055-HANDLER, BE-EP-056-HANDLER, BE-EP-068-HANDLER, BE-EP-069-HANDLER, BE-EP-070-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Atomic offers, availability and assignment.
- Acceptance: Competing accepts yield one assignment; suspended/stale/offline partners denied; worker restart releases only guarded expired offer.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-DISPATCH-TEST — Verify Atomic offers, availability and assignment

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DISPATCH-API, BE-EP-036-CONTRACT, BE-EP-037-CONTRACT, BE-EP-038-CONTRACT, BE-EP-039-CONTRACT, BE-EP-040-CONTRACT, BE-EP-041-CONTRACT, BE-EP-042-CONTRACT, BE-EP-055-CONTRACT, BE-EP-056-CONTRACT, BE-EP-068-CONTRACT, BE-EP-069-CONTRACT, BE-EP-070-CONTRACT.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Atomic offers, availability and assignment.
- Acceptance: Competing accepts yield one assignment; suspended/stale/offline partners denied; worker restart releases only guarded expired offer; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-SHOP-MODEL — Model Shopping checklist, missing items and substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DISPATCH-TEST, BE-ORDER-TEST, W-DEC-05, W-DEC-14.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Line version, proposal deadline, same/lower customer price, decision and removal policy.
- Acceptance: Model/index/policy review demonstrates invariants: Decision racing completion resolves once; no unapproved substitute bought; rejection/timeout applies auditable removal/refund policy.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-SHOP-API — Implement Shopping checklist, missing items and substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-SHOP-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-027-HANDLER, BE-EP-028-HANDLER, BE-EP-043-HANDLER, BE-EP-044-HANDLER.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Shopping checklist, missing items and substitutions.
- Acceptance: Decision racing completion resolves once; no unapproved substitute bought; rejection/timeout applies auditable removal/refund policy.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-SHOP-TEST — Verify Shopping checklist, missing items and substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-SHOP-API, BE-EP-027-CONTRACT, BE-EP-028-CONTRACT, BE-EP-043-CONTRACT, BE-EP-044-CONTRACT.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Shopping checklist, missing items and substitutions.
- Acceptance: Decision racing completion resolves once; no unapproved substitute bought; rejection/timeout applies auditable removal/refund policy; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-RECEIPT-MODEL — Model Private receipt and purchase proof

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-SHOP-TEST, W-DEC-07.
- Requirement(s): PAR-007.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Authorized upload intents, MIME/size validation, private storage and final purchase snapshot.
- Acceptance: Model/index/policy review demonstrates invariants: Unrelated partner denied; forged object/duplicate confirm rejected or idempotent; missing proof/unresolved line blocks completion.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-RECEIPT-API — Implement Private receipt and purchase proof

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-RECEIPT-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-045-HANDLER, BE-EP-046-HANDLER, BE-EP-047-HANDLER.
- Requirement(s): PAR-007.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Private receipt and purchase proof.
- Acceptance: Unrelated partner denied; forged object/duplicate confirm rejected or idempotent; missing proof/unresolved line blocks completion.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-RECEIPT-TEST — Verify Private receipt and purchase proof

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-RECEIPT-API, BE-EP-045-CONTRACT, BE-EP-046-CONTRACT, BE-EP-047-CONTRACT.
- Requirement(s): PAR-007.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Private receipt and purchase proof.
- Acceptance: Unrelated partner denied; forged object/duplicate confirm rejected or idempotent; missing proof/unresolved line blocks completion; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-DELIVERY-MODEL — Model Delivery OTP and incident handling

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-RECEIPT-TEST, BE-OUTBOX, W-DEC-16.
- Requirement(s): PAR-009, ADM-008.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Rate-limited server OTP, guarded completion and supervisor fallback incident.
- Acceptance: Model/index/policy review demonstrates invariants: Wrong/replayed OTP cannot complete twice; authorized fallback needs reason/audit; unreachable customer is explicit exception.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-DELIVERY-API — Implement Delivery OTP and incident handling

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DELIVERY-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-048-HANDLER, BE-EP-049-HANDLER, BE-EP-050-HANDLER.
- Requirement(s): PAR-009, ADM-008.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Delivery OTP and incident handling.
- Acceptance: Wrong/replayed OTP cannot complete twice; authorized fallback needs reason/audit; unreachable customer is explicit exception.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-DELIVERY-TEST — Verify Delivery OTP and incident handling

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DELIVERY-API, BE-EP-048-CONTRACT, BE-EP-049-CONTRACT, BE-EP-050-CONTRACT.
- Requirement(s): PAR-009, ADM-008.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Delivery OTP and incident handling.
- Acceptance: Wrong/replayed OTP cannot complete twice; authorized fallback needs reason/audit; unreachable customer is explicit exception; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FINANCE-MODEL — Model COD, costs, payout and reimbursement ledgers

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DELIVERY-TEST, W-DEC-07, W-DEC-08, W-DEC-09, W-DEC-14.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Append-only balanced ledger, actual cost, collection/remittance, reimbursement and payout separation.
- Acceptance: Model/index/policy review demonstrates invariants: Duplicate delivery does not duplicate ledger; over/under COD raises discrepancy; actual market costs never silently raise customer charge.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FINANCE-API — Implement COD, costs, payout and reimbursement ledgers

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-FINANCE-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-051-HANDLER, BE-EP-073-HANDLER, BE-EP-074-HANDLER.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for COD, costs, payout and reimbursement ledgers.
- Acceptance: Duplicate delivery does not duplicate ledger; over/under COD raises discrepancy; actual market costs never silently raise customer charge.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FINANCE-TEST — Verify COD, costs, payout and reimbursement ledgers

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-FINANCE-API, BE-EP-051-CONTRACT, BE-EP-073-CONTRACT, BE-EP-074-CONTRACT.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for COD, costs, payout and reimbursement ledgers.
- Acceptance: Duplicate delivery does not duplicate ledger; over/under COD raises discrepancy; actual market costs never silently raise customer charge; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-PAYMENT-MODEL — Model Conditional online gateway and refunds

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST, BE-FINANCE-TEST, W-DEC-06, W-DEC-12, W-DEC-14.
- Requirement(s): CUS-023, BE-006.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Feature flag, server intent, raw-body signed webhook, provider dedup, reconcile and idempotent refunds.
- Acceptance: Model/index/policy review demonstrates invariants: Forged/duplicate/out-of-order webhook cannot double capture/refund; killed-client recovery GET shows server result; flag off hides gateway.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-PAYMENT-API — Implement Conditional online gateway and refunds

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer.
- Depends on: BE-PAYMENT-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-029-HANDLER, BE-EP-030-HANDLER, BE-EP-031-HANDLER, BE-EP-032-HANDLER, BE-EP-075-HANDLER.
- Requirement(s): CUS-023, BE-006.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Conditional online gateway and refunds.
- Acceptance: Forged/duplicate/out-of-order webhook cannot double capture/refund; killed-client recovery GET shows server result; flag off hides gateway.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-PAYMENT-TEST — Verify Conditional online gateway and refunds

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer.
- Depends on: BE-PAYMENT-API, BE-EP-029-CONTRACT, BE-EP-030-CONTRACT, BE-EP-031-CONTRACT, BE-EP-032-CONTRACT, BE-EP-075-CONTRACT.
- Requirement(s): CUS-023, BE-006.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Conditional online gateway and refunds.
- Acceptance: Forged/duplicate/out-of-order webhook cannot double capture/refund; killed-client recovery GET shows server result; flag off hides gateway; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-SUPPORT-MODEL — Model Support tickets and exception audit

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST, BE-AUTH-TEST, W-DEC-13, W-DEC-20.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Owned tickets, scoped admin updates, reason/before-after audit and redacted logs.
- Acceptance: Model/index/policy review demonstrates invariants: Unauthorized ticket/receipt/audit access denied; permitted override records actor/reason/version and leaves historical evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-SUPPORT-API — Implement Support tickets and exception audit

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-033-HANDLER, BE-EP-034-HANDLER, BE-EP-057-HANDLER, BE-EP-071-HANDLER, BE-EP-072-HANDLER, BE-EP-076-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Support tickets and exception audit.
- Acceptance: Unauthorized ticket/receipt/audit access denied; permitted override records actor/reason/version and leaves historical evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-SUPPORT-TEST — Verify Support tickets and exception audit

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-SUPPORT-API, BE-EP-033-CONTRACT, BE-EP-034-CONTRACT, BE-EP-057-CONTRACT, BE-EP-071-CONTRACT, BE-EP-072-CONTRACT, BE-EP-076-CONTRACT.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Support tickets and exception audit.
- Acceptance: Unauthorized ticket/receipt/audit access denied; permitted override records actor/reason/version and leaves historical evidence; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ADMIN-MODEL — Model Admin overview and paginated workbench reads

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DISPATCH-TEST, BE-SUPPORT-TEST, BE-FINANCE-TEST.
- Requirement(s): ADM-002, ADM-005.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Role/zone scoped overview, order filters, timeline and authorized receipt reads.
- Acceptance: Model/index/policy review demonstrates invariants: Counts reconcile with orders; cursor bounds enforced; support cannot see unauthorized finance/PII exports.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ADMIN-API — Implement Admin overview and paginated workbench reads

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ADMIN-MODEL, BE-OPENAPI, BE-EVENTS, BE-EP-052-HANDLER, BE-EP-053-HANDLER, BE-EP-054-HANDLER.
- Requirement(s): ADM-002, ADM-005.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Admin overview and paginated workbench reads.
- Acceptance: Counts reconcile with orders; cursor bounds enforced; support cannot see unauthorized finance/PII exports.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-ADMIN-TEST — Verify Admin overview and paginated workbench reads

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-ADMIN-API, BE-EP-052-CONTRACT, BE-EP-053-CONTRACT, BE-EP-054-CONTRACT.
- Requirement(s): ADM-002, ADM-005.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Admin overview and paginated workbench reads.
- Acceptance: Counts reconcile with orders; cursor bounds enforced; support cannot see unauthorized finance/PII exports; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-RECOVERY-MODEL — Model Operational health, backups and Redis recovery

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-SOCKET, BE-PUSH, BE-OUTBOX, BE-ADMIN-TEST, W-DEC-17, W-DEC-19.
- Requirement(s): BE-007, BE-008, BE-010, BE-011.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Queue metrics, failure alerts, off-host DB backup, documented restore and outbox replay.
- Acceptance: Model/index/policy review demonstrates invariants: Redis loss cannot lose accepted order; restore on clean DB demonstrated; liveness/readiness distinguish Mongo/Redis degradation.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-RECOVERY-API — Implement Operational health, backups and Redis recovery

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-RECOVERY-MODEL, BE-OPENAPI, BE-EVENTS.
- Requirement(s): BE-007, BE-008, BE-010, BE-011.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Validated endpoints/services/repositories and provider or worker handlers for Operational health, backups and Redis recovery.
- Acceptance: Redis loss cannot lose accepted order; restore on clean DB demonstrated; liveness/readiness distinguish Mongo/Redis degradation.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-RECOVERY-TEST — Verify Operational health, backups and Redis recovery

- Status: **in_progress**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-RECOVERY-API.
- Requirement(s): BE-007, BE-008, BE-010, BE-011.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Integration/contract/security fixtures and failure evidence for Operational health, backups and Redis recovery.
- Acceptance: Redis loss cannot lose accepted order; restore on clean DB demonstrated; liveness/readiness distinguish Mongo/Redis degradation; publish exact command and result evidence.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FUTURE-CUS-006 — Plan optional Multi-language UI

- Status: **todo**; priority: **P1**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST.
- Requirement(s): CUS-006.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Flagged future contract/policy proposal only if scope is promoted.
- Acceptance: English default; structured keys for Bengali/Hindi future localization.
- Evidence: pending.

## BE-FUTURE-CUS-016 — Plan optional Catalogue filters

- Status: **in_progress**; priority: **P1**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST.
- Requirement(s): CUS-016.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Flagged future contract/policy proposal only if scope is promoted.
- Acceptance: Category, price band, sort.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FUTURE-CUS-017 — Plan optional Basic offers

- Status: **in_progress**; priority: **P1**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST.
- Requirement(s): CUS-017.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Flagged future contract/policy proposal only if scope is promoted.
- Acceptance: Validity, per-user limits and server-enforced discount calculations.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FUTURE-CUS-029 — Plan optional Live map

- Status: **in_progress**; priority: **P1**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST.
- Requirement(s): CUS-029.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Flagged future contract/policy proposal only if scope is promoted.
- Acceptance: Show partner location only during relevant delivery stage with valid consent.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FUTURE-PAR-011 — Plan optional Background location

- Status: **todo**; priority: **P1**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST.
- Requirement(s): PAR-011.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Flagged future contract/policy proposal only if scope is promoted.
- Acceptance: Only with separate Android permission/consent requirements and review.
- Evidence: pending.

## BE-FUTURE-ADM-011 — Plan optional Coupon/banner module

- Status: **in_progress**; priority: **P1**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST.
- Requirement(s): ADM-011.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Flagged future contract/policy proposal only if scope is promoted.
- Acceptance: Create/disable with constraints.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-FUTURE-ADM-012 — Plan optional Analytics exports

- Status: **in_progress**; priority: **P1**; owner: Backend engineer.
- Depends on: BE-ORDER-TEST.
- Requirement(s): ADM-012.
- Source: PRD; TAD_05_BACKEND.md; DESIGN_SYSTEM.
- Deliverable: Flagged future contract/policy proposal only if scope is promoted.
- Acceptance: CSV by date, zone, market, status.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-RELEASE — Prepare independent release and rollback

- Status: **todo**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-BOOT, BE-ENV, BE-DB, BE-REDIS, BE-HTTP, BE-OPENAPI, BE-EVENTS, BE-OUTBOX, BE-SOCKET, BE-PUSH, BE-AUTH-MODEL, BE-AUTH-API, BE-AUTH-TEST, BE-GEO-MODEL, BE-GEO-API, BE-GEO-TEST, BE-CATALOG-MODEL, BE-CATALOG-API, BE-CATALOG-TEST, BE-ADDRESS-MODEL, BE-ADDRESS-API, BE-ADDRESS-TEST, BE-CART-MODEL, BE-CART-API, BE-CART-TEST, BE-QUOTE-MODEL, BE-QUOTE-API, BE-QUOTE-TEST, BE-ORDER-MODEL, BE-ORDER-API, BE-ORDER-TEST, BE-DISPATCH-MODEL, BE-DISPATCH-API, BE-DISPATCH-TEST, BE-SHOP-MODEL, BE-SHOP-API, BE-SHOP-TEST, BE-RECEIPT-MODEL, BE-RECEIPT-API, BE-RECEIPT-TEST, BE-DELIVERY-MODEL, BE-DELIVERY-API, BE-DELIVERY-TEST, BE-FINANCE-MODEL, BE-FINANCE-API, BE-FINANCE-TEST, BE-SUPPORT-MODEL, BE-SUPPORT-API, BE-SUPPORT-TEST, BE-ADMIN-MODEL, BE-ADMIN-API, BE-ADMIN-TEST, BE-RECOVERY-MODEL, BE-RECOVERY-API, BE-RECOVERY-TEST, BE-EP-001-SCHEMA, BE-EP-001-HANDLER, BE-EP-001-CONTRACT, BE-EP-002-SCHEMA, BE-EP-002-HANDLER, BE-EP-002-CONTRACT, BE-EP-003-SCHEMA, BE-EP-003-HANDLER, BE-EP-003-CONTRACT, BE-EP-004-SCHEMA, BE-EP-004-HANDLER, BE-EP-004-CONTRACT, BE-EP-005-SCHEMA, BE-EP-005-HANDLER, BE-EP-005-CONTRACT, BE-EP-006-SCHEMA, BE-EP-006-HANDLER, BE-EP-006-CONTRACT, BE-EP-007-SCHEMA, BE-EP-007-HANDLER, BE-EP-007-CONTRACT, BE-EP-008-SCHEMA, BE-EP-008-HANDLER, BE-EP-008-CONTRACT, BE-EP-009-SCHEMA, BE-EP-009-HANDLER, BE-EP-009-CONTRACT, BE-EP-010-SCHEMA, BE-EP-010-HANDLER, BE-EP-010-CONTRACT, BE-EP-011-SCHEMA, BE-EP-011-HANDLER, BE-EP-011-CONTRACT, BE-EP-012-SCHEMA, BE-EP-012-HANDLER, BE-EP-012-CONTRACT, BE-EP-013-SCHEMA, BE-EP-013-HANDLER, BE-EP-013-CONTRACT, BE-EP-014-SCHEMA, BE-EP-014-HANDLER, BE-EP-014-CONTRACT, BE-EP-015-SCHEMA, BE-EP-015-HANDLER, BE-EP-015-CONTRACT, BE-EP-016-SCHEMA, BE-EP-016-HANDLER, BE-EP-016-CONTRACT, BE-EP-017-SCHEMA, BE-EP-017-HANDLER, BE-EP-017-CONTRACT, BE-EP-018-SCHEMA, BE-EP-018-HANDLER, BE-EP-018-CONTRACT, BE-EP-019-SCHEMA, BE-EP-019-HANDLER, BE-EP-019-CONTRACT, BE-EP-020-SCHEMA, BE-EP-020-HANDLER, BE-EP-020-CONTRACT, BE-EP-021-SCHEMA, BE-EP-021-HANDLER, BE-EP-021-CONTRACT, BE-EP-022-SCHEMA, BE-EP-022-HANDLER, BE-EP-022-CONTRACT, BE-EP-023-SCHEMA, BE-EP-023-HANDLER, BE-EP-023-CONTRACT, BE-EP-024-SCHEMA, BE-EP-024-HANDLER, BE-EP-024-CONTRACT, BE-EP-025-SCHEMA, BE-EP-025-HANDLER, BE-EP-025-CONTRACT, BE-EP-026-SCHEMA, BE-EP-026-HANDLER, BE-EP-026-CONTRACT, BE-EP-027-SCHEMA, BE-EP-027-HANDLER, BE-EP-027-CONTRACT, BE-EP-028-SCHEMA, BE-EP-028-HANDLER, BE-EP-028-CONTRACT, BE-EP-033-SCHEMA, BE-EP-033-HANDLER, BE-EP-033-CONTRACT, BE-EP-034-SCHEMA, BE-EP-034-HANDLER, BE-EP-034-CONTRACT, BE-EP-035-SCHEMA, BE-EP-035-HANDLER, BE-EP-035-CONTRACT, BE-EP-036-SCHEMA, BE-EP-036-HANDLER, BE-EP-036-CONTRACT, BE-EP-037-SCHEMA, BE-EP-037-HANDLER, BE-EP-037-CONTRACT, BE-EP-038-SCHEMA, BE-EP-038-HANDLER, BE-EP-038-CONTRACT, BE-EP-039-SCHEMA, BE-EP-039-HANDLER, BE-EP-039-CONTRACT, BE-EP-040-SCHEMA, BE-EP-040-HANDLER, BE-EP-040-CONTRACT, BE-EP-041-SCHEMA, BE-EP-041-HANDLER, BE-EP-041-CONTRACT, BE-EP-042-SCHEMA, BE-EP-042-HANDLER, BE-EP-042-CONTRACT, BE-EP-043-SCHEMA, BE-EP-043-HANDLER, BE-EP-043-CONTRACT, BE-EP-044-SCHEMA, BE-EP-044-HANDLER, BE-EP-044-CONTRACT, BE-EP-045-SCHEMA, BE-EP-045-HANDLER, BE-EP-045-CONTRACT, BE-EP-046-SCHEMA, BE-EP-046-HANDLER, BE-EP-046-CONTRACT, BE-EP-047-SCHEMA, BE-EP-047-HANDLER, BE-EP-047-CONTRACT, BE-EP-048-SCHEMA, BE-EP-048-HANDLER, BE-EP-048-CONTRACT, BE-EP-049-SCHEMA, BE-EP-049-HANDLER, BE-EP-049-CONTRACT, BE-EP-050-SCHEMA, BE-EP-050-HANDLER, BE-EP-050-CONTRACT, BE-EP-051-SCHEMA, BE-EP-051-HANDLER, BE-EP-051-CONTRACT, BE-EP-052-SCHEMA, BE-EP-052-HANDLER, BE-EP-052-CONTRACT, BE-EP-053-SCHEMA, BE-EP-053-HANDLER, BE-EP-053-CONTRACT, BE-EP-054-SCHEMA, BE-EP-054-HANDLER, BE-EP-054-CONTRACT, BE-EP-055-SCHEMA, BE-EP-055-HANDLER, BE-EP-055-CONTRACT, BE-EP-056-SCHEMA, BE-EP-056-HANDLER, BE-EP-056-CONTRACT, BE-EP-057-SCHEMA, BE-EP-057-HANDLER, BE-EP-057-CONTRACT, BE-EP-058-SCHEMA, BE-EP-058-HANDLER, BE-EP-058-CONTRACT, BE-EP-059-SCHEMA, BE-EP-059-HANDLER, BE-EP-059-CONTRACT, BE-EP-060-SCHEMA, BE-EP-060-HANDLER, BE-EP-060-CONTRACT, BE-EP-061-SCHEMA, BE-EP-061-HANDLER, BE-EP-061-CONTRACT, BE-EP-062-SCHEMA, BE-EP-062-HANDLER, BE-EP-062-CONTRACT, BE-EP-063-SCHEMA, BE-EP-063-HANDLER, BE-EP-063-CONTRACT, BE-EP-064-SCHEMA, BE-EP-064-HANDLER, BE-EP-064-CONTRACT, BE-EP-065-SCHEMA, BE-EP-065-HANDLER, BE-EP-065-CONTRACT, BE-EP-066-SCHEMA, BE-EP-066-HANDLER, BE-EP-066-CONTRACT, BE-EP-067-SCHEMA, BE-EP-067-HANDLER, BE-EP-067-CONTRACT, BE-EP-068-SCHEMA, BE-EP-068-HANDLER, BE-EP-068-CONTRACT, BE-EP-069-SCHEMA, BE-EP-069-HANDLER, BE-EP-069-CONTRACT, BE-EP-070-SCHEMA, BE-EP-070-HANDLER, BE-EP-070-CONTRACT, BE-EP-071-SCHEMA, BE-EP-071-HANDLER, BE-EP-071-CONTRACT, BE-EP-072-SCHEMA, BE-EP-072-HANDLER, BE-EP-072-CONTRACT, BE-EP-073-SCHEMA, BE-EP-073-HANDLER, BE-EP-073-CONTRACT, BE-EP-074-SCHEMA, BE-EP-074-HANDLER, BE-EP-074-CONTRACT, BE-EP-076-SCHEMA, BE-EP-076-HANDLER, BE-EP-076-CONTRACT, W-CROSS-ISOLATED.
- Requirement(s): cross-cutting.
- Source: Relevant TAD definition of done and release sections.
- Deliverable: Versioned artifact, environment validation, release CI, integration review and rollback procedure.
- Acceptance: All repo P0 acceptance evidence complete; current integration hash reviewed; own release builds from isolated checkout; privacy/signing/secrets validated.
- Evidence: pending.

## BE-EP-001-SCHEMA — Specify POST /v1/auth/otp/send

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_otp_send; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public/rate-limited scope, idempotency/version rules.
- Acceptance: Send login challenge; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-001-HANDLER — Implement POST /v1/auth/otp/send

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-001-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_otp_send; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Send login challenge; authorized for Public/rate-limited.
- Acceptance: Send login challenge meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-001-CONTRACT — Verify POST /v1/auth/otp/send

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-001-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_otp_send; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Send login challenge.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-002-SCHEMA — Specify POST /v1/auth/otp/verify

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_otp_verify; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public/rate-limited scope, idempotency/version rules.
- Acceptance: Verify challenge, return session; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-002-HANDLER — Implement POST /v1/auth/otp/verify

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-002-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_otp_verify; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Verify challenge, return session; authorized for Public/rate-limited.
- Acceptance: Verify challenge, return session meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-002-CONTRACT — Verify POST /v1/auth/otp/verify

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-002-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_otp_verify; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Verify challenge, return session.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-003-SCHEMA — Specify POST /v1/auth/token/refresh

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_token_refresh; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Session scope, idempotency/version rules.
- Acceptance: Rotate refresh token; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-003-HANDLER — Implement POST /v1/auth/token/refresh

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-003-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_token_refresh; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Rotate refresh token; authorized for Session.
- Acceptance: Rotate refresh token meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-003-CONTRACT — Verify POST /v1/auth/token/refresh

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-003-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_token_refresh; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Rotate refresh token.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-004-SCHEMA — Specify POST /v1/auth/logout

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_logout; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Session scope, idempotency/version rules.
- Acceptance: Revoke/clear tokens; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-004-HANDLER — Implement POST /v1/auth/logout

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-004-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_logout; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Revoke/clear tokens; authorized for Session.
- Acceptance: Revoke/clear tokens meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-004-CONTRACT — Verify POST /v1/auth/logout

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-004-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_auth_logout; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Revoke/clear tokens.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-005-SCHEMA — Specify GET /v1/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId get_v1_me; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer/partner scope, idempotency/version rules.
- Acceptance: Current user/partner; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-005-HANDLER — Implement GET /v1/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-005-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId get_v1_me; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Current user/partner; authorized for Customer/partner.
- Acceptance: Current user/partner meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-005-CONTRACT — Verify GET /v1/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-005-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId get_v1_me; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Current user/partner.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-006-SCHEMA — Specify POST /v1/devices

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_devices; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Auth scope, idempotency/version rules.
- Acceptance: Register/rotate FCM token; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-006-HANDLER — Implement POST /v1/devices

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-006-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_devices; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Register/rotate FCM token; authorized for Auth.
- Acceptance: Register/rotate FCM token meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-006-CONTRACT — Verify POST /v1/devices

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-006-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_devices; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Register/rotate FCM token.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-007-SCHEMA — Specify DELETE /v1/devices/:deviceId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId delete_v1_devices_deviceId; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Auth scope, idempotency/version rules.
- Acceptance: Revoke push target; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-007-HANDLER — Implement DELETE /v1/devices/:deviceId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-007-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId delete_v1_devices_deviceId; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Revoke push target; authorized for Auth.
- Acceptance: Revoke push target meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-007-CONTRACT — Verify DELETE /v1/devices/:deviceId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-007-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId delete_v1_devices_deviceId; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Revoke push target.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-008-SCHEMA — Specify POST /v1/admin/auth/login

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_auth_login; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Admin scope, idempotency/version rules.
- Acceptance: Admin identity login; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-008-HANDLER — Implement POST /v1/admin/auth/login

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-008-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_auth_login; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Admin identity login; authorized for Admin.
- Acceptance: Admin identity login meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-008-CONTRACT — Verify POST /v1/admin/auth/login

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-008-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_auth_login; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Admin identity login.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-009-SCHEMA — Specify POST /v1/admin/auth/logout

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_auth_logout; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Admin scope, idempotency/version rules.
- Acceptance: Revoke admin session; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-009-HANDLER — Implement POST /v1/admin/auth/logout

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-009-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_auth_logout; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Revoke admin session; authorized for Admin.
- Acceptance: Revoke admin session meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-009-CONTRACT — Verify POST /v1/admin/auth/logout

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-009-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_auth_logout; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Revoke admin session.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-010-SCHEMA — Specify GET /v1/geo/serviceability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-GEO-MODEL, BE-OPENAPI.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_geo_serviceability; owning domain GEO.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public scope, idempotency/version rules.
- Acceptance: Zone/market eligibility; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-010-HANDLER — Implement GET /v1/geo/serviceability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-010-SCHEMA, BE-HTTP.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_geo_serviceability; owning domain GEO.
- Deliverable: Validated controller/service/repository route for Zone/market eligibility; authorized for Public.
- Acceptance: Zone/market eligibility meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-010-CONTRACT — Verify GET /v1/geo/serviceability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-010-HANDLER.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_geo_serviceability; owning domain GEO.
- Deliverable: Provider contract fixtures and integration evidence for Zone/market eligibility.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-011-SCHEMA — Specify GET /v1/catalog/home

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_catalog_home; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public scope, idempotency/version rules.
- Acceptance: Home categories/shelves; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-011-HANDLER — Implement GET /v1/catalog/home

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-011-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_catalog_home; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for Home categories/shelves; authorized for Public.
- Acceptance: Home categories/shelves meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-011-CONTRACT — Verify GET /v1/catalog/home

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-011-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_catalog_home; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for Home categories/shelves.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-012-SCHEMA — Specify GET /v1/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_categories; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public scope, idempotency/version rules.
- Acceptance: Active category list; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-012-HANDLER — Implement GET /v1/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-012-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_categories; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for Active category list; authorized for Public.
- Acceptance: Active category list meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-012-CONTRACT — Verify GET /v1/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-012-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_categories; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for Active category list.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-013-SCHEMA — Specify GET /v1/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public scope, idempotency/version rules.
- Acceptance: Products with server price; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-013-HANDLER — Implement GET /v1/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-013-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for Products with server price; authorized for Public.
- Acceptance: Products with server price meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-013-CONTRACT — Verify GET /v1/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-013-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for Products with server price.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-014-SCHEMA — Specify GET /v1/products/search

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products_search; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public scope, idempotency/version rules.
- Acceptance: Product search; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-014-HANDLER — Implement GET /v1/products/search

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-014-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products_search; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for Product search; authorized for Public.
- Acceptance: Product search meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-014-CONTRACT — Verify GET /v1/products/search

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-014-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products_search; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for Product search.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-015-SCHEMA — Specify GET /v1/products/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products_id; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Public scope, idempotency/version rules.
- Acceptance: Product detail; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-015-HANDLER — Implement GET /v1/products/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-015-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products_id; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for Product detail; authorized for Public.
- Acceptance: Product detail meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-015-CONTRACT — Verify GET /v1/products/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-015-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_products_id; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for Product detail.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-016-SCHEMA — Specify GET /v1/addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADDRESS-MODEL, BE-OPENAPI.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_addresses; owning domain ADDRESS.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer scope, idempotency/version rules.
- Acceptance: Saved addresses; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-016-HANDLER — Implement GET /v1/addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-016-SCHEMA, BE-HTTP.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_addresses; owning domain ADDRESS.
- Deliverable: Validated controller/service/repository route for Saved addresses; authorized for Customer.
- Acceptance: Saved addresses meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-016-CONTRACT — Verify GET /v1/addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-016-HANDLER.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_addresses; owning domain ADDRESS.
- Deliverable: Provider contract fixtures and integration evidence for Saved addresses.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-017-SCHEMA — Specify POST /v1/addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADDRESS-MODEL, BE-OPENAPI.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_addresses; owning domain ADDRESS.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer scope, idempotency/version rules.
- Acceptance: Add address; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-017-HANDLER — Implement POST /v1/addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-017-SCHEMA, BE-HTTP.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_addresses; owning domain ADDRESS.
- Deliverable: Validated controller/service/repository route for Add address; authorized for Customer.
- Acceptance: Add address meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-017-CONTRACT — Verify POST /v1/addresses

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-017-HANDLER.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_addresses; owning domain ADDRESS.
- Deliverable: Provider contract fixtures and integration evidence for Add address.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-018-SCHEMA — Specify PATCH /v1/addresses/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADDRESS-MODEL, BE-OPENAPI.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_addresses_id; owning domain ADDRESS.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Edit address; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-018-HANDLER — Implement PATCH /v1/addresses/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-018-SCHEMA, BE-HTTP.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_addresses_id; owning domain ADDRESS.
- Deliverable: Validated controller/service/repository route for Edit address; authorized for Customer owner.
- Acceptance: Edit address meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-018-CONTRACT — Verify PATCH /v1/addresses/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-018-HANDLER.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_addresses_id; owning domain ADDRESS.
- Deliverable: Provider contract fixtures and integration evidence for Edit address.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-019-SCHEMA — Specify DELETE /v1/addresses/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADDRESS-MODEL, BE-OPENAPI.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId delete_v1_addresses_id; owning domain ADDRESS.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Soft-delete address; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-019-HANDLER — Implement DELETE /v1/addresses/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-019-SCHEMA, BE-HTTP.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId delete_v1_addresses_id; owning domain ADDRESS.
- Deliverable: Validated controller/service/repository route for Soft-delete address; authorized for Customer owner.
- Acceptance: Soft-delete address meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-019-CONTRACT — Verify DELETE /v1/addresses/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-019-HANDLER.
- Requirement(s): CUS-004.
- Source: TAD_05_BACKEND section 5; operationId delete_v1_addresses_id; owning domain ADDRESS.
- Deliverable: Provider contract fixtures and integration evidence for Soft-delete address.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-020-SCHEMA — Specify GET /v1/cart

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CART-MODEL, BE-OPENAPI.
- Requirement(s): CUS-013, CUS-014.
- Source: TAD_05_BACKEND section 5; operationId get_v1_cart; owning domain CART.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer scope, idempotency/version rules.
- Acceptance: Current cart; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-020-HANDLER — Implement GET /v1/cart

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-020-SCHEMA, BE-HTTP.
- Requirement(s): CUS-013, CUS-014.
- Source: TAD_05_BACKEND section 5; operationId get_v1_cart; owning domain CART.
- Deliverable: Validated controller/service/repository route for Current cart; authorized for Customer.
- Acceptance: Current cart meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-020-CONTRACT — Verify GET /v1/cart

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-020-HANDLER.
- Requirement(s): CUS-013, CUS-014.
- Source: TAD_05_BACKEND section 5; operationId get_v1_cart; owning domain CART.
- Deliverable: Provider contract fixtures and integration evidence for Current cart.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-021-SCHEMA — Specify PUT /v1/cart

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CART-MODEL, BE-OPENAPI.
- Requirement(s): CUS-013, CUS-014.
- Source: TAD_05_BACKEND section 5; operationId put_v1_cart; owning domain CART.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer scope, idempotency/version rules.
- Acceptance: Replace/sync draft with expected revision; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-021-HANDLER — Implement PUT /v1/cart

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-021-SCHEMA, BE-HTTP.
- Requirement(s): CUS-013, CUS-014.
- Source: TAD_05_BACKEND section 5; operationId put_v1_cart; owning domain CART.
- Deliverable: Validated controller/service/repository route for Replace/sync draft with expected revision; authorized for Customer.
- Acceptance: Replace/sync draft with expected revision meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-021-CONTRACT — Verify PUT /v1/cart

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-021-HANDLER.
- Requirement(s): CUS-013, CUS-014.
- Source: TAD_05_BACKEND section 5; operationId put_v1_cart; owning domain CART.
- Deliverable: Provider contract fixtures and integration evidence for Replace/sync draft with expected revision.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-022-SCHEMA — Specify POST /v1/checkout/quote

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-QUOTE-MODEL, BE-OPENAPI.
- Requirement(s): BE-002, CUS-020, CUS-022.
- Source: TAD_05_BACKEND section 5; operationId post_v1_checkout_quote; owning domain QUOTE.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer scope, idempotency/version rules.
- Acceptance: Validated price/zone/fee snapshot; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-022-HANDLER — Implement POST /v1/checkout/quote

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-022-SCHEMA, BE-HTTP.
- Requirement(s): BE-002, CUS-020, CUS-022.
- Source: TAD_05_BACKEND section 5; operationId post_v1_checkout_quote; owning domain QUOTE.
- Deliverable: Validated controller/service/repository route for Validated price/zone/fee snapshot; authorized for Customer.
- Acceptance: Validated price/zone/fee snapshot meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-022-CONTRACT — Verify POST /v1/checkout/quote

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-022-HANDLER.
- Requirement(s): BE-002, CUS-020, CUS-022.
- Source: TAD_05_BACKEND section 5; operationId post_v1_checkout_quote; owning domain QUOTE.
- Deliverable: Provider contract fixtures and integration evidence for Validated price/zone/fee snapshot.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-023-SCHEMA — Specify POST /v1/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ORDER-MODEL, BE-OPENAPI.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders; owning domain ORDER.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer scope, idempotency/version rules.
- Acceptance: Create from valid quote; idempotent; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-023-HANDLER — Implement POST /v1/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-023-SCHEMA, BE-HTTP.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders; owning domain ORDER.
- Deliverable: Validated controller/service/repository route for Create from valid quote; idempotent; authorized for Customer.
- Acceptance: Create from valid quote; idempotent meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-023-CONTRACT — Verify POST /v1/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-023-HANDLER.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders; owning domain ORDER.
- Deliverable: Provider contract fixtures and integration evidence for Create from valid quote; idempotent.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-024-SCHEMA — Specify GET /v1/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ORDER-MODEL, BE-OPENAPI.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders; owning domain ORDER.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer scope, idempotency/version rules.
- Acceptance: Own order list; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-024-HANDLER — Implement GET /v1/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-024-SCHEMA, BE-HTTP.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders; owning domain ORDER.
- Deliverable: Validated controller/service/repository route for Own order list; authorized for Customer.
- Acceptance: Own order list meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-024-CONTRACT — Verify GET /v1/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-024-HANDLER.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders; owning domain ORDER.
- Deliverable: Provider contract fixtures and integration evidence for Own order list.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-025-SCHEMA — Specify GET /v1/orders/:publicOrderId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ORDER-MODEL, BE-OPENAPI.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders_publicOrderId; owning domain ORDER.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Current order detail and event version; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-025-HANDLER — Implement GET /v1/orders/:publicOrderId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-025-SCHEMA, BE-HTTP.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders_publicOrderId; owning domain ORDER.
- Deliverable: Validated controller/service/repository route for Current order detail and event version; authorized for Customer owner.
- Acceptance: Current order detail and event version meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-025-CONTRACT — Verify GET /v1/orders/:publicOrderId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-025-HANDLER.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders_publicOrderId; owning domain ORDER.
- Deliverable: Provider contract fixtures and integration evidence for Current order detail and event version.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-026-SCHEMA — Specify POST /v1/orders/:id/cancel

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ORDER-MODEL, BE-OPENAPI.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders_id_cancel; owning domain ORDER.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Policy-driven cancellation; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-026-HANDLER — Implement POST /v1/orders/:id/cancel

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-026-SCHEMA, BE-HTTP.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders_id_cancel; owning domain ORDER.
- Deliverable: Validated controller/service/repository route for Policy-driven cancellation; authorized for Customer owner.
- Acceptance: Policy-driven cancellation meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-026-CONTRACT — Verify POST /v1/orders/:id/cancel

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-026-HANDLER.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders_id_cancel; owning domain ORDER.
- Deliverable: Provider contract fixtures and integration evidence for Policy-driven cancellation.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-027-SCHEMA — Specify GET /v1/orders/:id/substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SHOP-MODEL, BE-OPENAPI.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders_id_substitutions; owning domain SHOP.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Pending/decided substitutions; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-027-HANDLER — Implement GET /v1/orders/:id/substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-027-SCHEMA, BE-HTTP.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders_id_substitutions; owning domain SHOP.
- Deliverable: Validated controller/service/repository route for Pending/decided substitutions; authorized for Customer owner.
- Acceptance: Pending/decided substitutions meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-027-CONTRACT — Verify GET /v1/orders/:id/substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-027-HANDLER.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId get_v1_orders_id_substitutions; owning domain SHOP.
- Deliverable: Provider contract fixtures and integration evidence for Pending/decided substitutions.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-028-SCHEMA — Specify POST /v1/orders/:id/substitutions/:requestId/decision

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SHOP-MODEL, BE-OPENAPI.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders_id_substitutions_requestId_decision; owning domain SHOP.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Approve/reject with order version; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-028-HANDLER — Implement POST /v1/orders/:id/substitutions/:requestId/decision

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-028-SCHEMA, BE-HTTP.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders_id_substitutions_requestId_decision; owning domain SHOP.
- Deliverable: Validated controller/service/repository route for Approve/reject with order version; authorized for Customer owner.
- Acceptance: Approve/reject with order version meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-028-CONTRACT — Verify POST /v1/orders/:id/substitutions/:requestId/decision

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-028-HANDLER.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId post_v1_orders_id_substitutions_requestId_decision; owning domain SHOP.
- Deliverable: Provider contract fixtures and integration evidence for Approve/reject with order version.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-029-SCHEMA — Specify POST /v1/payments/gateway-order

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-PAYMENT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_payments_gateway_order; owning domain PAYMENT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Create payment intent for eligible order; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-029-HANDLER — Implement POST /v1/payments/gateway-order

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-029-SCHEMA, BE-HTTP.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_payments_gateway_order; owning domain PAYMENT.
- Deliverable: Validated controller/service/repository route for Create payment intent for eligible order; authorized for Customer owner.
- Acceptance: Create payment intent for eligible order meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-029-CONTRACT — Verify POST /v1/payments/gateway-order

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-029-HANDLER.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_payments_gateway_order; owning domain PAYMENT.
- Deliverable: Provider contract fixtures and integration evidence for Create payment intent for eligible order.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-030-SCHEMA — Specify GET /v1/payments/:paymentId/status

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-PAYMENT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId get_v1_payments_paymentId_status; owning domain PAYMENT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Authoritative payment state; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-030-HANDLER — Implement GET /v1/payments/:paymentId/status

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-030-SCHEMA, BE-HTTP.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId get_v1_payments_paymentId_status; owning domain PAYMENT.
- Deliverable: Validated controller/service/repository route for Authoritative payment state; authorized for Customer owner.
- Acceptance: Authoritative payment state meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-030-CONTRACT — Verify GET /v1/payments/:paymentId/status

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-030-HANDLER.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId get_v1_payments_paymentId_status; owning domain PAYMENT.
- Deliverable: Provider contract fixtures and integration evidence for Authoritative payment state.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-031-SCHEMA — Specify POST /v1/payments/verify-callback

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-PAYMENT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_payments_verify_callback; owning domain PAYMENT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Verify payment return safely; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-031-HANDLER — Implement POST /v1/payments/verify-callback

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-031-SCHEMA, BE-HTTP.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_payments_verify_callback; owning domain PAYMENT.
- Deliverable: Validated controller/service/repository route for Verify payment return safely; authorized for Customer owner.
- Acceptance: Verify payment return safely meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-031-CONTRACT — Verify POST /v1/payments/verify-callback

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-031-HANDLER.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_payments_verify_callback; owning domain PAYMENT.
- Deliverable: Provider contract fixtures and integration evidence for Verify payment return safely.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-032-SCHEMA — Specify POST /v1/webhooks/payment

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-PAYMENT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_webhooks_payment; owning domain PAYMENT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Gateway signed scope, idempotency/version rules.
- Acceptance: Raw-body signed event, dedup; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-032-HANDLER — Implement POST /v1/webhooks/payment

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-032-SCHEMA, BE-HTTP.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_webhooks_payment; owning domain PAYMENT.
- Deliverable: Validated controller/service/repository route for Raw-body signed event, dedup; authorized for Gateway signed.
- Acceptance: Raw-body signed event, dedup meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-032-CONTRACT — Verify POST /v1/webhooks/payment

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-032-HANDLER.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_webhooks_payment; owning domain PAYMENT.
- Deliverable: Provider contract fixtures and integration evidence for Raw-body signed event, dedup.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-033-SCHEMA — Specify GET /v1/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_support_tickets; owning domain SUPPORT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Own tickets; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-033-HANDLER — Implement GET /v1/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-033-SCHEMA, BE-HTTP.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_support_tickets; owning domain SUPPORT.
- Deliverable: Validated controller/service/repository route for Own tickets; authorized for Customer owner.
- Acceptance: Own tickets meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-033-CONTRACT — Verify GET /v1/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-033-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_support_tickets; owning domain SUPPORT.
- Deliverable: Provider contract fixtures and integration evidence for Own tickets.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-034-SCHEMA — Specify POST /v1/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId post_v1_support_tickets; owning domain SUPPORT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Customer owner scope, idempotency/version rules.
- Acceptance: Support issue; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-034-HANDLER — Implement POST /v1/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-034-SCHEMA, BE-HTTP.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId post_v1_support_tickets; owning domain SUPPORT.
- Deliverable: Validated controller/service/repository route for Support issue; authorized for Customer owner.
- Acceptance: Support issue meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-034-CONTRACT — Verify POST /v1/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-034-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId post_v1_support_tickets; owning domain SUPPORT.
- Deliverable: Provider contract fixtures and integration evidence for Support issue.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-035-SCHEMA — Specify GET /v1/partner/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_me; owning domain AUTH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Approved/registered partner scope, idempotency/version rules.
- Acceptance: Approval and capability; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-035-HANDLER — Implement GET /v1/partner/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-035-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_me; owning domain AUTH.
- Deliverable: Validated controller/service/repository route for Approval and capability; authorized for Approved/registered partner.
- Acceptance: Approval and capability meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-035-CONTRACT — Verify GET /v1/partner/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-035-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_me; owning domain AUTH.
- Deliverable: Provider contract fixtures and integration evidence for Approval and capability.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-036-SCHEMA — Specify PUT /v1/partner/availability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId put_v1_partner_availability; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Approved partner scope, idempotency/version rules.
- Acceptance: Request online/offline; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-036-HANDLER — Implement PUT /v1/partner/availability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-036-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId put_v1_partner_availability; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Request online/offline; authorized for Approved partner.
- Acceptance: Request online/offline meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-036-CONTRACT — Verify PUT /v1/partner/availability

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-036-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId put_v1_partner_availability; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Request online/offline.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-037-SCHEMA — Specify POST /v1/partner/heartbeat

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_heartbeat; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Available/active partner scope, idempotency/version rules.
- Acceptance: Current location and health; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-037-HANDLER — Implement POST /v1/partner/heartbeat

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-037-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_heartbeat; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Current location and health; authorized for Available/active partner.
- Acceptance: Current location and health meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-037-CONTRACT — Verify POST /v1/partner/heartbeat

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-037-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_heartbeat; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Current location and health.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-038-SCHEMA — Specify GET /v1/partner/offers/current

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_offers_current; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Partner scope, idempotency/version rules.
- Acceptance: Current live offer; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-038-HANDLER — Implement GET /v1/partner/offers/current

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-038-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_offers_current; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Current live offer; authorized for Partner.
- Acceptance: Current live offer meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-038-CONTRACT — Verify GET /v1/partner/offers/current

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-038-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_offers_current; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Current live offer.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-039-SCHEMA — Specify POST /v1/partner/offers/:id/accept

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_offers_id_accept; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Partner scope, idempotency/version rules.
- Acceptance: Atomic valid acceptance; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-039-HANDLER — Implement POST /v1/partner/offers/:id/accept

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-039-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_offers_id_accept; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Atomic valid acceptance; authorized for Partner.
- Acceptance: Atomic valid acceptance meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-039-CONTRACT — Verify POST /v1/partner/offers/:id/accept

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-039-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_offers_id_accept; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Atomic valid acceptance.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-040-SCHEMA — Specify POST /v1/partner/offers/:id/decline

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_offers_id_decline; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Partner scope, idempotency/version rules.
- Acceptance: Decline one offer; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-040-HANDLER — Implement POST /v1/partner/offers/:id/decline

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-040-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_offers_id_decline; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Decline one offer; authorized for Partner.
- Acceptance: Decline one offer meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-040-CONTRACT — Verify POST /v1/partner/offers/:id/decline

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-040-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_offers_id_decline; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Decline one offer.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-041-SCHEMA — Specify GET /v1/partner/assignments/active

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_assignments_active; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Partner scope, idempotency/version rules.
- Acceptance: Current task snapshot; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-041-HANDLER — Implement GET /v1/partner/assignments/active

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-041-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_assignments_active; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Current task snapshot; authorized for Partner.
- Acceptance: Current task snapshot meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-041-CONTRACT — Verify GET /v1/partner/assignments/active

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-041-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_assignments_active; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Current task snapshot.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-042-SCHEMA — Specify POST /v1/partner/orders/:id/arrive-market

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_arrive_market; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Record arrival; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-042-HANDLER — Implement POST /v1/partner/orders/:id/arrive-market

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-042-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_arrive_market; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Record arrival; authorized for Assigned partner.
- Acceptance: Record arrival meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-042-CONTRACT — Verify POST /v1/partner/orders/:id/arrive-market

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-042-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_arrive_market; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Record arrival.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-043-SCHEMA — Specify PATCH /v1/partner/orders/:id/shopping-items/:lineId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SHOP-MODEL, BE-OPENAPI.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_partner_orders_id_shopping_items_lineId; owning domain SHOP.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Bought/missing draft; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-043-HANDLER — Implement PATCH /v1/partner/orders/:id/shopping-items/:lineId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-043-SCHEMA, BE-HTTP.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_partner_orders_id_shopping_items_lineId; owning domain SHOP.
- Deliverable: Validated controller/service/repository route for Bought/missing draft; authorized for Assigned partner.
- Acceptance: Bought/missing draft meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-043-CONTRACT — Verify PATCH /v1/partner/orders/:id/shopping-items/:lineId

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-043-HANDLER.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_partner_orders_id_shopping_items_lineId; owning domain SHOP.
- Deliverable: Provider contract fixtures and integration evidence for Bought/missing draft.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-044-SCHEMA — Specify POST /v1/partner/orders/:id/substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SHOP-MODEL, BE-OPENAPI.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_substitutions; owning domain SHOP.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Propose substitute; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-044-HANDLER — Implement POST /v1/partner/orders/:id/substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-044-SCHEMA, BE-HTTP.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_substitutions; owning domain SHOP.
- Deliverable: Validated controller/service/repository route for Propose substitute; authorized for Assigned partner.
- Acceptance: Propose substitute meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-044-CONTRACT — Verify POST /v1/partner/orders/:id/substitutions

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-044-HANDLER.
- Requirement(s): BE-005, PAR-005, PAR-006, CUS-026.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_substitutions; owning domain SHOP.
- Deliverable: Provider contract fixtures and integration evidence for Propose substitute.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-045-SCHEMA — Specify POST /v1/partner/orders/:id/receipt/upload-intent

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-RECEIPT-MODEL, BE-OPENAPI.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_receipt_upload_intent; owning domain RECEIPT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Get signed upload; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-045-HANDLER — Implement POST /v1/partner/orders/:id/receipt/upload-intent

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-045-SCHEMA, BE-HTTP.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_receipt_upload_intent; owning domain RECEIPT.
- Deliverable: Validated controller/service/repository route for Get signed upload; authorized for Assigned partner.
- Acceptance: Get signed upload meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-045-CONTRACT — Verify POST /v1/partner/orders/:id/receipt/upload-intent

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-045-HANDLER.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_receipt_upload_intent; owning domain RECEIPT.
- Deliverable: Provider contract fixtures and integration evidence for Get signed upload.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-046-SCHEMA — Specify POST /v1/partner/orders/:id/receipt/confirm

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-RECEIPT-MODEL, BE-OPENAPI.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_receipt_confirm; owning domain RECEIPT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Attach proof and actual cost; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-046-HANDLER — Implement POST /v1/partner/orders/:id/receipt/confirm

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-046-SCHEMA, BE-HTTP.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_receipt_confirm; owning domain RECEIPT.
- Deliverable: Validated controller/service/repository route for Attach proof and actual cost; authorized for Assigned partner.
- Acceptance: Attach proof and actual cost meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-046-CONTRACT — Verify POST /v1/partner/orders/:id/receipt/confirm

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-046-HANDLER.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_receipt_confirm; owning domain RECEIPT.
- Deliverable: Provider contract fixtures and integration evidence for Attach proof and actual cost.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-047-SCHEMA — Specify POST /v1/partner/orders/:id/shopping/complete

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-RECEIPT-MODEL, BE-OPENAPI.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_shopping_complete; owning domain RECEIPT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Finalize shopping step; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-047-HANDLER — Implement POST /v1/partner/orders/:id/shopping/complete

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-047-SCHEMA, BE-HTTP.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_shopping_complete; owning domain RECEIPT.
- Deliverable: Validated controller/service/repository route for Finalize shopping step; authorized for Assigned partner.
- Acceptance: Finalize shopping step meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-047-CONTRACT — Verify POST /v1/partner/orders/:id/shopping/complete

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-047-HANDLER.
- Requirement(s): PAR-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_shopping_complete; owning domain RECEIPT.
- Deliverable: Provider contract fixtures and integration evidence for Finalize shopping step.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-048-SCHEMA — Specify POST /v1/partner/orders/:id/out-for-delivery

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DELIVERY-MODEL, BE-OPENAPI.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_out_for_delivery; owning domain DELIVERY.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Begin delivery; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-048-HANDLER — Implement POST /v1/partner/orders/:id/out-for-delivery

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-048-SCHEMA, BE-HTTP.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_out_for_delivery; owning domain DELIVERY.
- Deliverable: Validated controller/service/repository route for Begin delivery; authorized for Assigned partner.
- Acceptance: Begin delivery meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-048-CONTRACT — Verify POST /v1/partner/orders/:id/out-for-delivery

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-048-HANDLER.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_out_for_delivery; owning domain DELIVERY.
- Deliverable: Provider contract fixtures and integration evidence for Begin delivery.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-049-SCHEMA — Specify POST /v1/partner/orders/:id/delivery/verify

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DELIVERY-MODEL, BE-OPENAPI.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_delivery_verify; owning domain DELIVERY.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Server OTP verification; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-049-HANDLER — Implement POST /v1/partner/orders/:id/delivery/verify

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-049-SCHEMA, BE-HTTP.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_delivery_verify; owning domain DELIVERY.
- Deliverable: Validated controller/service/repository route for Server OTP verification; authorized for Assigned partner.
- Acceptance: Server OTP verification meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-049-CONTRACT — Verify POST /v1/partner/orders/:id/delivery/verify

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-049-HANDLER.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_delivery_verify; owning domain DELIVERY.
- Deliverable: Provider contract fixtures and integration evidence for Server OTP verification.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-050-SCHEMA — Specify POST /v1/partner/orders/:id/incident

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DELIVERY-MODEL, BE-OPENAPI.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_incident; owning domain DELIVERY.
- Deliverable: Request params/query/body, success/error response schemas, examples, Assigned partner scope, idempotency/version rules.
- Acceptance: Exception/unreachable; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-050-HANDLER — Implement POST /v1/partner/orders/:id/incident

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-050-SCHEMA, BE-HTTP.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_incident; owning domain DELIVERY.
- Deliverable: Validated controller/service/repository route for Exception/unreachable; authorized for Assigned partner.
- Acceptance: Exception/unreachable meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-050-CONTRACT — Verify POST /v1/partner/orders/:id/incident

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-050-HANDLER.
- Requirement(s): PAR-009, ADM-008.
- Source: TAD_05_BACKEND section 5; operationId post_v1_partner_orders_id_incident; owning domain DELIVERY.
- Deliverable: Provider contract fixtures and integration evidence for Exception/unreachable.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-051-SCHEMA — Specify GET /v1/partner/earnings

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-FINANCE-MODEL, BE-OPENAPI.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_earnings; owning domain FINANCE.
- Deliverable: Request params/query/body, success/error response schemas, examples, Partner scope, idempotency/version rules.
- Acceptance: Payout and reimbursement view; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-051-HANDLER — Implement GET /v1/partner/earnings

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-051-SCHEMA, BE-HTTP.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_earnings; owning domain FINANCE.
- Deliverable: Validated controller/service/repository route for Payout and reimbursement view; authorized for Partner.
- Acceptance: Payout and reimbursement view meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-051-CONTRACT — Verify GET /v1/partner/earnings

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-051-HANDLER.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_partner_earnings; owning domain FINANCE.
- Deliverable: Provider contract fixtures and integration evidence for Payout and reimbursement view.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-052-SCHEMA — Specify GET /v1/admin/overview

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADMIN-MODEL, BE-OPENAPI.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_overview; owning domain ADMIN.
- Deliverable: Request params/query/body, success/error response schemas, examples, Permitted admin scope, idempotency/version rules.
- Acceptance: KPI summary; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-052-HANDLER — Implement GET /v1/admin/overview

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-052-SCHEMA, BE-HTTP.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_overview; owning domain ADMIN.
- Deliverable: Validated controller/service/repository route for KPI summary; authorized for Permitted admin.
- Acceptance: KPI summary meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-052-CONTRACT — Verify GET /v1/admin/overview

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-052-HANDLER.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_overview; owning domain ADMIN.
- Deliverable: Provider contract fixtures and integration evidence for KPI summary.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-053-SCHEMA — Specify GET /v1/admin/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADMIN-MODEL, BE-OPENAPI.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_orders; owning domain ADMIN.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops/support scope, idempotency/version rules.
- Acceptance: Filter/paginate orders; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-053-HANDLER — Implement GET /v1/admin/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-053-SCHEMA, BE-HTTP.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_orders; owning domain ADMIN.
- Deliverable: Validated controller/service/repository route for Filter/paginate orders; authorized for Ops/support.
- Acceptance: Filter/paginate orders meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-053-CONTRACT — Verify GET /v1/admin/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-053-HANDLER.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_orders; owning domain ADMIN.
- Deliverable: Provider contract fixtures and integration evidence for Filter/paginate orders.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-054-SCHEMA — Specify GET /v1/admin/orders/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADMIN-MODEL, BE-OPENAPI.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_orders_id; owning domain ADMIN.
- Deliverable: Request params/query/body, success/error response schemas, examples, Permitted admin scope, idempotency/version rules.
- Acceptance: Details/events/receipt; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-054-HANDLER — Implement GET /v1/admin/orders/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-054-SCHEMA, BE-HTTP.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_orders_id; owning domain ADMIN.
- Deliverable: Validated controller/service/repository route for Details/events/receipt; authorized for Permitted admin.
- Acceptance: Details/events/receipt meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-054-CONTRACT — Verify GET /v1/admin/orders/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-054-HANDLER.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_orders_id; owning domain ADMIN.
- Deliverable: Provider contract fixtures and integration evidence for Details/events/receipt.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-055-SCHEMA — Specify POST /v1/admin/orders/:id/assign

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_assign; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Dispatcher scope, idempotency/version rules.
- Acceptance: Manual partner assignment; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-055-HANDLER — Implement POST /v1/admin/orders/:id/assign

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-055-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_assign; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Manual partner assignment; authorized for Dispatcher.
- Acceptance: Manual partner assignment meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-055-CONTRACT — Verify POST /v1/admin/orders/:id/assign

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-055-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_assign; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Manual partner assignment.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-056-SCHEMA — Specify POST /v1/admin/orders/:id/reassign

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_reassign; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Dispatcher scope, idempotency/version rules.
- Acceptance: Override with reason/version; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-056-HANDLER — Implement POST /v1/admin/orders/:id/reassign

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-056-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_reassign; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Override with reason/version; authorized for Dispatcher.
- Acceptance: Override with reason/version meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-056-CONTRACT — Verify POST /v1/admin/orders/:id/reassign

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-056-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_reassign; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Override with reason/version.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-057-SCHEMA — Specify POST /v1/admin/orders/:id/resolve-exception

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_resolve_exception; owning domain SUPPORT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops/support scope, idempotency/version rules.
- Acceptance: Exception resolution; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-057-HANDLER — Implement POST /v1/admin/orders/:id/resolve-exception

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-057-SCHEMA, BE-HTTP.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_resolve_exception; owning domain SUPPORT.
- Deliverable: Validated controller/service/repository route for Exception resolution; authorized for Ops/support.
- Acceptance: Exception resolution meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-057-CONTRACT — Verify POST /v1/admin/orders/:id/resolve-exception

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-057-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_orders_id_resolve_exception; owning domain SUPPORT.
- Deliverable: Provider contract fixtures and integration evidence for Exception resolution.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-058-SCHEMA — Specify GET /v1/admin/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_products; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Catalogue scope, idempotency/version rules.
- Acceptance: List/create; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-058-HANDLER — Implement GET /v1/admin/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-058-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_products; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for List/create; authorized for Catalogue.
- Acceptance: List/create meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-058-CONTRACT — Verify GET /v1/admin/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-058-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_products; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for List/create.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-059-SCHEMA — Specify POST /v1/admin/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_products; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Catalogue scope, idempotency/version rules.
- Acceptance: List/create; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-059-HANDLER — Implement POST /v1/admin/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-059-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_products; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for List/create; authorized for Catalogue.
- Acceptance: List/create meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-059-CONTRACT — Verify POST /v1/admin/products

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-059-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_products; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for List/create.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-060-SCHEMA — Specify PATCH /v1/admin/products/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_products_id; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Catalogue scope, idempotency/version rules.
- Acceptance: Versioned edit/archive; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-060-HANDLER — Implement PATCH /v1/admin/products/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-060-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_products_id; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for Versioned edit/archive; authorized for Catalogue.
- Acceptance: Versioned edit/archive meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-060-CONTRACT — Verify PATCH /v1/admin/products/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-060-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_products_id; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for Versioned edit/archive.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-061-SCHEMA — Specify GET /v1/admin/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_categories; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Catalogue scope, idempotency/version rules.
- Acceptance: List/create; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-061-HANDLER — Implement GET /v1/admin/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-061-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_categories; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for List/create; authorized for Catalogue.
- Acceptance: List/create meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-061-CONTRACT — Verify GET /v1/admin/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-061-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_categories; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for List/create.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-062-SCHEMA — Specify POST /v1/admin/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_categories; owning domain CATALOG.
- Deliverable: Request params/query/body, success/error response schemas, examples, Catalogue scope, idempotency/version rules.
- Acceptance: List/create; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-062-HANDLER — Implement POST /v1/admin/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-062-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_categories; owning domain CATALOG.
- Deliverable: Validated controller/service/repository route for List/create; authorized for Catalogue.
- Acceptance: List/create meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-062-CONTRACT — Verify POST /v1/admin/categories

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-062-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_categories; owning domain CATALOG.
- Deliverable: Provider contract fixtures and integration evidence for List/create.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-063-SCHEMA — Specify GET /v1/admin/markets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-GEO-MODEL, BE-OPENAPI.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_markets; owning domain GEO.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: List/create; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-063-HANDLER — Implement GET /v1/admin/markets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-063-SCHEMA, BE-HTTP.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_markets; owning domain GEO.
- Deliverable: Validated controller/service/repository route for List/create; authorized for Ops.
- Acceptance: List/create meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-063-CONTRACT — Verify GET /v1/admin/markets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-063-HANDLER.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_markets; owning domain GEO.
- Deliverable: Provider contract fixtures and integration evidence for List/create.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-064-SCHEMA — Specify POST /v1/admin/markets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-GEO-MODEL, BE-OPENAPI.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_markets; owning domain GEO.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: List/create; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-064-HANDLER — Implement POST /v1/admin/markets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-064-SCHEMA, BE-HTTP.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_markets; owning domain GEO.
- Deliverable: Validated controller/service/repository route for List/create; authorized for Ops.
- Acceptance: List/create meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-064-CONTRACT — Verify POST /v1/admin/markets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-064-HANDLER.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_markets; owning domain GEO.
- Deliverable: Provider contract fixtures and integration evidence for List/create.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-065-SCHEMA — Specify PATCH /v1/admin/markets/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-GEO-MODEL, BE-OPENAPI.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_markets_id; owning domain GEO.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: Update market status; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-065-HANDLER — Implement PATCH /v1/admin/markets/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-065-SCHEMA, BE-HTTP.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_markets_id; owning domain GEO.
- Deliverable: Validated controller/service/repository route for Update market status; authorized for Ops.
- Acceptance: Update market status meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-065-CONTRACT — Verify PATCH /v1/admin/markets/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-065-HANDLER.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_markets_id; owning domain GEO.
- Deliverable: Provider contract fixtures and integration evidence for Update market status.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-066-SCHEMA — Specify GET /v1/admin/zones

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-GEO-MODEL, BE-OPENAPI.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_zones; owning domain GEO.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: Service zones and fee rules; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-066-HANDLER — Implement GET /v1/admin/zones

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-066-SCHEMA, BE-HTTP.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_zones; owning domain GEO.
- Deliverable: Validated controller/service/repository route for Service zones and fee rules; authorized for Ops.
- Acceptance: Service zones and fee rules meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-066-CONTRACT — Verify GET /v1/admin/zones

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-066-HANDLER.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_zones; owning domain GEO.
- Deliverable: Provider contract fixtures and integration evidence for Service zones and fee rules.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-067-SCHEMA — Specify POST /v1/admin/zones

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-GEO-MODEL, BE-OPENAPI.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_zones; owning domain GEO.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: Service zones and fee rules; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-067-HANDLER — Implement POST /v1/admin/zones

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-067-SCHEMA, BE-HTTP.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_zones; owning domain GEO.
- Deliverable: Validated controller/service/repository route for Service zones and fee rules; authorized for Ops.
- Acceptance: Service zones and fee rules meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-067-CONTRACT — Verify POST /v1/admin/zones

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-067-HANDLER.
- Requirement(s): CUS-002, CUS-003, ADM-004.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_zones; owning domain GEO.
- Deliverable: Provider contract fixtures and integration evidence for Service zones and fee rules.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-068-SCHEMA — Specify GET /v1/admin/partners

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_partners; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: Partner roster; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-068-HANDLER — Implement GET /v1/admin/partners

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-068-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_partners; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Partner roster; authorized for Ops.
- Acceptance: Partner roster meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-068-CONTRACT — Verify GET /v1/admin/partners

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-068-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_partners; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Partner roster.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-069-SCHEMA — Specify POST /v1/admin/partners/:id/approve

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_partners_id_approve; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: Approve; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-069-HANDLER — Implement POST /v1/admin/partners/:id/approve

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-069-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_partners_id_approve; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Approve; authorized for Ops.
- Acceptance: Approve meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-069-CONTRACT — Verify POST /v1/admin/partners/:id/approve

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-069-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_partners_id_approve; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Approve.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-070-SCHEMA — Specify POST /v1/admin/partners/:id/suspend

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-DISPATCH-MODEL, BE-OPENAPI.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_partners_id_suspend; owning domain DISPATCH.
- Deliverable: Request params/query/body, success/error response schemas, examples, Ops scope, idempotency/version rules.
- Acceptance: Suspend with reason; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-070-HANDLER — Implement POST /v1/admin/partners/:id/suspend

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-070-SCHEMA, BE-HTTP.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_partners_id_suspend; owning domain DISPATCH.
- Deliverable: Validated controller/service/repository route for Suspend with reason; authorized for Ops.
- Acceptance: Suspend with reason meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-070-CONTRACT — Verify POST /v1/admin/partners/:id/suspend

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-070-HANDLER.
- Requirement(s): BE-004, PAR-002, PAR-003, PAR-004, PAR-008, ADM-006, ADM-007.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_partners_id_suspend; owning domain DISPATCH.
- Deliverable: Provider contract fixtures and integration evidence for Suspend with reason.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-071-SCHEMA — Specify GET /v1/admin/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_support_tickets; owning domain SUPPORT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Support scope, idempotency/version rules.
- Acceptance: Ticket queue; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-071-HANDLER — Implement GET /v1/admin/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-071-SCHEMA, BE-HTTP.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_support_tickets; owning domain SUPPORT.
- Deliverable: Validated controller/service/repository route for Ticket queue; authorized for Support.
- Acceptance: Ticket queue meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-071-CONTRACT — Verify GET /v1/admin/support/tickets

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-071-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_support_tickets; owning domain SUPPORT.
- Deliverable: Provider contract fixtures and integration evidence for Ticket queue.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-072-SCHEMA — Specify PATCH /v1/admin/support/tickets/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_support_tickets_id; owning domain SUPPORT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Support scope, idempotency/version rules.
- Acceptance: Update ticket; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-072-HANDLER — Implement PATCH /v1/admin/support/tickets/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-072-SCHEMA, BE-HTTP.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_support_tickets_id; owning domain SUPPORT.
- Deliverable: Validated controller/service/repository route for Update ticket; authorized for Support.
- Acceptance: Update ticket meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-072-CONTRACT — Verify PATCH /v1/admin/support/tickets/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-072-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId patch_v1_admin_support_tickets_id; owning domain SUPPORT.
- Deliverable: Provider contract fixtures and integration evidence for Update ticket.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-073-SCHEMA — Specify GET /v1/admin/finance/payments

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-FINANCE-MODEL, BE-OPENAPI.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_finance_payments; owning domain FINANCE.
- Deliverable: Request params/query/body, success/error response schemas, examples, Finance scope, idempotency/version rules.
- Acceptance: Payment collection ledger; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-073-HANDLER — Implement GET /v1/admin/finance/payments

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-073-SCHEMA, BE-HTTP.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_finance_payments; owning domain FINANCE.
- Deliverable: Validated controller/service/repository route for Payment collection ledger; authorized for Finance.
- Acceptance: Payment collection ledger meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-073-CONTRACT — Verify GET /v1/admin/finance/payments

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-073-HANDLER.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_finance_payments; owning domain FINANCE.
- Deliverable: Provider contract fixtures and integration evidence for Payment collection ledger.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-074-SCHEMA — Specify GET /v1/admin/finance/reconciliation

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-FINANCE-MODEL, BE-OPENAPI.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_finance_reconciliation; owning domain FINANCE.
- Deliverable: Request params/query/body, success/error response schemas, examples, Finance scope, idempotency/version rules.
- Acceptance: Purchase/COD/payout entries; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-074-HANDLER — Implement GET /v1/admin/finance/reconciliation

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-074-SCHEMA, BE-HTTP.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_finance_reconciliation; owning domain FINANCE.
- Deliverable: Validated controller/service/repository route for Purchase/COD/payout entries; authorized for Finance.
- Acceptance: Purchase/COD/payout entries meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-074-CONTRACT — Verify GET /v1/admin/finance/reconciliation

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-074-HANDLER.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_finance_reconciliation; owning domain FINANCE.
- Deliverable: Provider contract fixtures and integration evidence for Purchase/COD/payout entries.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-075-SCHEMA — Specify POST /v1/admin/finance/refunds

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-PAYMENT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_finance_refunds; owning domain PAYMENT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Finance scope, idempotency/version rules.
- Acceptance: Initiate idempotent refund; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-075-HANDLER — Implement POST /v1/admin/finance/refunds

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-075-SCHEMA, BE-HTTP.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_finance_refunds; owning domain PAYMENT.
- Deliverable: Validated controller/service/repository route for Initiate idempotent refund; authorized for Finance.
- Acceptance: Initiate idempotent refund meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-075-CONTRACT — Verify POST /v1/admin/finance/refunds

- Status: **in_progress**; priority: **Conditional P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-075-HANDLER.
- Requirement(s): CUS-023, BE-006.
- Source: TAD_05_BACKEND section 5; operationId post_v1_admin_finance_refunds; owning domain PAYMENT.
- Deliverable: Provider contract fixtures and integration evidence for Initiate idempotent refund.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-076-SCHEMA — Specify GET /v1/admin/audit

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_audit; owning domain SUPPORT.
- Deliverable: Request params/query/body, success/error response schemas, examples, Super-admin scope, idempotency/version rules.
- Acceptance: Sensitive change log; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-076-HANDLER — Implement GET /v1/admin/audit

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-076-SCHEMA, BE-HTTP.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_audit; owning domain SUPPORT.
- Deliverable: Validated controller/service/repository route for Sensitive change log; authorized for Super-admin.
- Acceptance: Sensitive change log meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-076-CONTRACT — Verify GET /v1/admin/audit

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-076-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_audit; owning domain SUPPORT.
- Deliverable: Provider contract fixtures and integration evidence for Sensitive change log.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-077-SCHEMA — Specify GET /v1/admin/reports/orders

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-ADMIN-MODEL, BE-OPENAPI.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_reports_orders; owning domain ADMIN.
- Deliverable: Request params/query/body, success/error response schemas, examples, Permitted admin scope, idempotency/version rules.
- Acceptance: Paginated/export job; agree field names, optionality, quantities/paise and role-safe responses; schema examples validate; map path identifier aliases explicitly.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-077-HANDLER — Implement GET /v1/admin/reports/orders

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-077-SCHEMA, BE-HTTP.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_reports_orders; owning domain ADMIN.
- Deliverable: Validated controller/service/repository route for Paginated/export job; authorized for Permitted admin.
- Acceptance: Paginated/export job meets reviewed schema; role/ownership and policy enforced server-side; mutation transactions/idempotency/version conflict behavior follow owning domain.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-077-CONTRACT — Verify GET /v1/admin/reports/orders

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-077-HANDLER.
- Requirement(s): ADM-002, ADM-005.
- Source: TAD_05_BACKEND section 5; operationId get_v1_admin_reports_orders; owning domain ADMIN.
- Deliverable: Provider contract fixtures and integration evidence for Paginated/export job.
- Acceptance: Success example matches schema; malformed/unauthorized input rejected; owning domain failure or stale/retry path demonstrated; request ID and sensitive-field redaction verified.
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-078-SCHEMA — Specify GET /v1/config

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ADMIN-MODEL, BE-OPENAPI.
- Requirement(s): ADM-002, ADM-005.
- Source: Backend API inventory; operationId get_v1_config.
- Deliverable: Local provider and payment capabilities; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-078-HANDLER — Implement GET /v1/config

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-078-SCHEMA, BE-HTTP.
- Requirement(s): ADM-002, ADM-005.
- Source: Backend API inventory; operationId get_v1_config.
- Deliverable: Local provider and payment capabilities; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-078-CONTRACT — Verify GET /v1/config

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-078-HANDLER.
- Requirement(s): ADM-002, ADM-005.
- Source: Backend API inventory; operationId get_v1_config.
- Deliverable: Local provider and payment capabilities; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-079-SCHEMA — Specify PATCH /v1/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-AUTH-MODEL, BE-OPENAPI.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: Backend API inventory; operationId patch_v1_me.
- Deliverable: Update own display name; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-079-HANDLER — Implement PATCH /v1/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-079-SCHEMA, BE-HTTP.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: Backend API inventory; operationId patch_v1_me.
- Deliverable: Update own display name; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-079-CONTRACT — Verify PATCH /v1/me

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-079-HANDLER.
- Requirement(s): BE-001, CUS-001, CUS-005, PAR-001, ADM-001.
- Source: Backend API inventory; operationId patch_v1_me.
- Deliverable: Update own display name; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-080-SCHEMA — Specify GET /v1/orders/:id/events

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ORDER-MODEL, BE-OPENAPI.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: Backend API inventory; operationId get_v1_orders_id_events.
- Deliverable: Authorized sequence recovery events; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-080-HANDLER — Implement GET /v1/orders/:id/events

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-080-SCHEMA, BE-HTTP.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: Backend API inventory; operationId get_v1_orders_id_events.
- Deliverable: Authorized sequence recovery events; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-080-CONTRACT — Verify GET /v1/orders/:id/events

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-080-HANDLER.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: Backend API inventory; operationId get_v1_orders_id_events.
- Deliverable: Authorized sequence recovery events; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-081-SCHEMA — Specify PUT /v1/uploads/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-RECEIPT-MODEL, BE-OPENAPI.
- Requirement(s): PAR-007.
- Source: Backend API inventory; operationId put_v1_uploads_id.
- Deliverable: Upload private PNG/JPEG proof; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-081-HANDLER — Implement PUT /v1/uploads/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-081-SCHEMA, BE-HTTP.
- Requirement(s): PAR-007.
- Source: Backend API inventory; operationId put_v1_uploads_id.
- Deliverable: Upload private PNG/JPEG proof; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-081-CONTRACT — Verify PUT /v1/uploads/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-081-HANDLER.
- Requirement(s): PAR-007.
- Source: Backend API inventory; operationId put_v1_uploads_id.
- Deliverable: Upload private PNG/JPEG proof; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-082-SCHEMA — Specify GET /v1/receipts/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-RECEIPT-MODEL, BE-OPENAPI.
- Requirement(s): PAR-007.
- Source: Backend API inventory; operationId get_v1_receipts_id.
- Deliverable: Read authorized private receipt; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-082-HANDLER — Implement GET /v1/receipts/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-082-SCHEMA, BE-HTTP.
- Requirement(s): PAR-007.
- Source: Backend API inventory; operationId get_v1_receipts_id.
- Deliverable: Read authorized private receipt; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-082-CONTRACT — Verify GET /v1/receipts/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-082-HANDLER.
- Requirement(s): PAR-007.
- Source: Backend API inventory; operationId get_v1_receipts_id.
- Deliverable: Read authorized private receipt; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-083-SCHEMA — Specify GET /v1/admin/customers

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-SUPPORT-MODEL, BE-OPENAPI.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: Backend API inventory; operationId get_v1_admin_customers.
- Deliverable: Masked customer directory; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-083-HANDLER — Implement GET /v1/admin/customers

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-083-SCHEMA, BE-HTTP.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: Backend API inventory; operationId get_v1_admin_customers.
- Deliverable: Masked customer directory; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-083-CONTRACT — Verify GET /v1/admin/customers

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-083-HANDLER.
- Requirement(s): CUS-027, ADM-008, ADM-010, BE-009.
- Source: Backend API inventory; operationId get_v1_admin_customers.
- Deliverable: Masked customer directory; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-084-SCHEMA — Specify GET /v1/partner/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-ORDER-MODEL, BE-OPENAPI.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: Backend API inventory; operationId get_v1_partner_orders.
- Deliverable: Assigned order history; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-084-HANDLER — Implement GET /v1/partner/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-084-SCHEMA, BE-HTTP.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: Backend API inventory; operationId get_v1_partner_orders.
- Deliverable: Assigned order history; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-084-CONTRACT — Verify GET /v1/partner/orders

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-084-HANDLER.
- Requirement(s): BE-003, CUS-021, CUS-024, CUS-025, CUS-028.
- Source: Backend API inventory; operationId get_v1_partner_orders.
- Deliverable: Assigned order history; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-085-SCHEMA — Specify PATCH /v1/admin/finance/entries/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-FINANCE-MODEL, BE-OPENAPI.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: Backend API inventory; operationId patch_v1_admin_finance_entries_id.
- Deliverable: Audited idempotent settlement transition; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-085-HANDLER — Implement PATCH /v1/admin/finance/entries/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-085-SCHEMA, BE-HTTP.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: Backend API inventory; operationId patch_v1_admin_finance_entries_id.
- Deliverable: Audited idempotent settlement transition; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-085-CONTRACT — Verify PATCH /v1/admin/finance/entries/:id

- Status: **in_progress**; priority: **P0**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-085-HANDLER.
- Requirement(s): BE-006, PAR-010, ADM-009.
- Source: Backend API inventory; operationId patch_v1_admin_finance_entries_id.
- Deliverable: Audited idempotent settlement transition; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-086-SCHEMA — Specify GET /v1/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId get_v1_promotions.
- Deliverable: Current promotion terms; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-086-HANDLER — Implement GET /v1/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-086-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId get_v1_promotions.
- Deliverable: Current promotion terms; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-086-CONTRACT — Verify GET /v1/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-086-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId get_v1_promotions.
- Deliverable: Current promotion terms; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-087-SCHEMA — Specify GET /v1/admin/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId get_v1_admin_promotions.
- Deliverable: Promotion inventory; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-087-HANDLER — Implement GET /v1/admin/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-087-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId get_v1_admin_promotions.
- Deliverable: Promotion inventory; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-087-CONTRACT — Verify GET /v1/admin/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-087-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId get_v1_admin_promotions.
- Deliverable: Promotion inventory; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-088-SCHEMA — Specify POST /v1/admin/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId post_v1_admin_promotions.
- Deliverable: Create bounded promotion; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-088-HANDLER — Implement POST /v1/admin/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-088-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId post_v1_admin_promotions.
- Deliverable: Create bounded promotion; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-088-CONTRACT — Verify POST /v1/admin/promotions

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-088-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId post_v1_admin_promotions.
- Deliverable: Create bounded promotion; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-089-SCHEMA — Specify PATCH /v1/admin/promotions/:id

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-CATALOG-MODEL, BE-OPENAPI.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId patch_v1_admin_promotions_id.
- Deliverable: Versioned promotion edit; complete request/response schemas and examples.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-089-HANDLER — Implement PATCH /v1/admin/promotions/:id

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-089-SCHEMA, BE-HTTP.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId patch_v1_admin_promotions_id.
- Deliverable: Versioned promotion edit; authorized and versioned route.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-EP-089-CONTRACT — Verify PATCH /v1/admin/promotions/:id

- Status: **in_progress**; priority: **P1**; owner: Backend engineer + contract QA.
- Depends on: BE-EP-089-HANDLER.
- Requirement(s): CUS-010, CUS-011, CUS-012, CUS-015, ADM-003.
- Source: Backend API inventory; operationId patch_v1_admin_promotions_id.
- Deliverable: Versioned promotion edit; success, denial, conflict and schema-compatible fixtures.
- Acceptance: Validate role-safe success and error shapes, ownership and invalid input; verify version/idempotency rules where applicable and record exact regression evidence..
- Evidence: docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/verify-typecheck.log; docs/evidence/verify-test-integration.log.

## BE-LOCAL-BACKUP — Verify local database and private receipt restore

- Status: **done**; priority: **P0**; owner: Backend engineer.
- Depends on: BE-DB.
- Requirement(s): BE-007, BE-008, BE-010, BE-011.
- Source: Local development recovery; BE-RECOVERY acceptance slice.
- Deliverable: Snapshot backup, receipt integrity manifest and empty-target transactional restore CLI.
- Acceptance: Real Mongo restore retains product data and image bytes, revokes sessions and refuses a populated target; tampered data or missing images writes no records..
- Evidence: tests/e2e/backup.test.ts; docs/evidence/verify-test-e2e.log.

## BE-EP-090-SCHEMA — Specify POST /v1/admin/media/images

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: BE-OPENAPI.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Specify POST /v1/admin/media/images.
- Acceptance: Role-safe upload/list schema, validated input, bounded pagination, denial/recovery examples and request IDs are accepted..
- Evidence: src/contracts.ts; contracts/openapi.json; tests/integration/media.test.ts; docs/evidence/verify-test-integration.log.

## BE-EP-090-HANDLER — Implement POST /v1/admin/media/images

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: BE-EP-090-SCHEMA, BE-HTTP.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Implement POST /v1/admin/media/images.
- Acceptance: Role-safe upload/list schema, validated input, bounded pagination, denial/recovery examples and request IDs are accepted..
- Evidence: src/contracts.ts; contracts/openapi.json; tests/integration/media.test.ts; docs/evidence/verify-test-integration.log.

## BE-EP-090-CONTRACT — Verify POST /v1/admin/media/images

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: BE-EP-090-HANDLER.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Verify POST /v1/admin/media/images.
- Acceptance: Role-safe upload/list schema, validated input, bounded pagination, denial/recovery examples and request IDs are accepted..
- Evidence: src/contracts.ts; contracts/openapi.json; tests/integration/media.test.ts; docs/evidence/verify-test-integration.log.

## BE-EP-091-SCHEMA — Specify GET /v1/admin/media/images

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: BE-OPENAPI.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Specify GET /v1/admin/media/images.
- Acceptance: Role-safe upload/list schema, validated input, bounded pagination, denial/recovery examples and request IDs are accepted..
- Evidence: src/contracts.ts; contracts/openapi.json; tests/integration/media.test.ts; docs/evidence/verify-test-integration.log.

## BE-EP-091-HANDLER — Implement GET /v1/admin/media/images

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: BE-EP-091-SCHEMA, BE-HTTP.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Implement GET /v1/admin/media/images.
- Acceptance: Role-safe upload/list schema, validated input, bounded pagination, denial/recovery examples and request IDs are accepted..
- Evidence: src/contracts.ts; contracts/openapi.json; tests/integration/media.test.ts; docs/evidence/verify-test-integration.log.

## BE-EP-091-CONTRACT — Verify GET /v1/admin/media/images

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: BE-EP-091-HANDLER.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Verify GET /v1/admin/media/images.
- Acceptance: Role-safe upload/list schema, validated input, bounded pagination, denial/recovery examples and request IDs are accepted..
- Evidence: src/contracts.ts; contracts/openapi.json; tests/integration/media.test.ts; docs/evidence/verify-test-integration.log.

## BE-MEDIA-PROVIDER — Upload normalized catalogue images to Cloudinary

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: none.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Upload normalized catalogue images to Cloudinary.
- Acceptance: Authenticated catalogue/super-admin only; strict PNG/JPEG/WebP bytes and 2 MB limit; metadata stripped; server selects HaatGo folder; provider failure is recoverable..
- Evidence: tests/integration/media.test.ts; docs/evidence/verify-test-integration.log.

## BE-MEDIA-REFERENCES — Persist catalogue media references and audit

- Status: **in_progress**; priority: **P0**; owner: Surface engineer + QA.
- Depends on: none.
- Requirement(s): ADM-003.
- Source: User request: Cloudinary catalogue images/category icons and complete section asset library.
- Deliverable: Persist catalogue media references and audit.
- Acceptance: Uploaded product/category IDs bind the correct media kind and URL; media upload is audited; fresh seed contains owned public asset metadata..
- Evidence: tests/integration/media.test.ts; src/assets/catalogue-assets.json; docs/evidence/verify-test-e2e.log.

## BE-RENDER-KEEPALIVE — Keep the Render web service awake with a liveness ping

- Status: **done**; priority: **P1**; owner: Backend engineer.
- Depends on: none.
- Requirement(s): BE-011.
- Source: User request for the HaatGo Render service; Render inactivity timeout.
- Deliverable: Render-web-only periodic request to /health/live with bounded timeout and shutdown cleanup.
- Acceptance: Local and worker processes do not ping; Render web service pings every ten minutes; failures are logged and timer is cleaned up; hosted deployment verification is recorded.
- Evidence: tests/render-keep-alive.test.ts; docs/IMPLEMENTATION_EVIDENCE.md; docs/evidence/render-keep-alive.log.
