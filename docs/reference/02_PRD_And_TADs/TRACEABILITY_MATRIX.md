# HaatGo — Requirements Traceability Matrix

**Version:** 1.0 draft · **Date:** 14 November 2026  
**Purpose:** Translate PRD acceptance criteria into deliverable surfaces, API modules, and tests.

## 1. Surface abbreviations

- **CM:** customer bare React Native Android + Paper.
- **PM:** delivery partner bare React Native Android + Paper.
- **CW:** React customer website + shadcn/ui.
- **AW:** React admin website + shadcn/ui.
- **BE:** Express TypeScript API + MongoDB + Redis/BullMQ.
- **TAD 01–05:** the five architecture files in the same pack.

## 2. Customer requirements

| PRD ID | Priority | Screen / surface | Primary backend contract | Verification |
|---|---|---|---|---|
| CUS-001 | P0 | CM, CW OTP | POST /v1/auth/otp/send, /verify | Expired/invalid OTP, throttling |
| CUS-002 | P0 | CM, CW location | GET /v1/geo/serviceability | GPS denied, manual PIN |
| CUS-003 | P0 | CM, CW serviceability | GET /v1/geo/serviceability | Zone closed/unserviceable |
| CUS-004 | P0 | CM, CW addresses | /v1/addresses CRUD | Ownership/field validation |
| CUS-005 | P0 | CM, CW account | GET /v1/me, logout | Sensitive state cleared |
| CUS-006 | P1 | CM, CW locale | Shared i18n keys | Bengali/Hindi rendering |
| CUS-010 | P0 | CM, CW categories | /v1/catalog/home, /categories | Active catalogue |
| CUS-011 | P0 | CM, CW search | GET /v1/products/search | Alias/no-result behavior |
| CUS-012 | P0 | CM, CW product | GET /v1/products/:id | Price/pack/availability |
| CUS-013 | P0 | CM, CW quantity | PUT /v1/cart | Bounds/revision conflict |
| CUS-014 | P0 | CM, CW cart | GET /v1/cart, PUT /v1/cart | Total and empty state |
| CUS-015 | P0 | CM, CW item info | Catalogue/order policy | Market stock disclaimer |
| CUS-016 | P1 | CM, CW listing | GET /v1/products with filters | Sort/filter/paging |
| CUS-017 | P1 | CM, CW offers | Pricing/promotion module | Rule validity |
| CUS-020 | P0 | CM, CW checkout | POST /v1/checkout/quote | Server amount snapshot |
| CUS-021 | P0 | CM, CW order CTA | POST /v1/orders | Same key = one order |
| CUS-022 | P0 | CM, CW COD | POST /v1/orders | COD eligibility |
| CUS-023 | Cond. P0 | CM, CW online payment | /v1/payments/* | Signature/webhook recovery |
| CUS-024 | P0 | CM, CW confirmation | GET /v1/orders/:id | Correct public ID/status |
| CUS-025 | P0 | CM, CW history/tracking | GET /v1/orders* + events | Same state cross clients |
| CUS-026 | P0 | CM, CW substitute | POST decision endpoint | Expired/reject/approve |
| CUS-027 | P0 | CM, CW help | POST /v1/support/tickets | Ticket created |
| CUS-028 | P0 | CM, CW cancel | POST /v1/orders/:id/cancel | Allowed vs denied stage |
| CUS-029 | P1 | CM, CW live map | Socket + permissioned location | Consent/route fallback |

## 3. Partner requirements

| PRD ID | Priority | Screen / surface | Primary backend contract | Verification |
|---|---|---|---|---|
| PAR-001 | P0 | PM OTP/approval | /v1/partner/me, auth | Unapproved partner denied |
| PAR-002 | P0 | PM home | PUT /availability, POST /heartbeat | Stale/offline ineligible |
| PAR-003 | P0 | PM offer | POST /partner/offers/:id/accept | Expiry/double claim conflict |
| PAR-004 | P0 | PM market route | GET active assignment | Correct market map intent |
| PAR-005 | P0 | PM checklist | PATCH shopping-items/:lineId | Item-state audit/retry |
| PAR-006 | P0 | PM substitution | POST /substitutions | Approval gate |
| PAR-007 | P0 | PM receipt | /receipt/upload-intent, /confirm | Signed upload and validation |
| PAR-008 | P0 | PM customer route | GET active assignment | Owner-only address |
| PAR-009 | P0 | PM OTP delivery | POST /delivery/verify | Incorrect OTP rejected |
| PAR-010 | P0 | PM earnings | GET /v1/partner/earnings | Separate reimbursement and COD |
| PAR-011 | P1 | PM background location | Android native permission + heartbeat | Consent, lifecycle, battery |

## 4. Admin requirements

| PRD ID | Priority | Screen / surface | Primary backend contract | Verification |
|---|---|---|---|---|
| ADM-001 | P0 | AW login | /v1/admin/auth/* | MFA/roles as approved |
| ADM-002 | P0 | AW overview | GET /v1/admin/overview | Date/zone metrics |
| ADM-003 | P0 | AW catalogue | /v1/admin/products/categories | Versioned edit/audit |
| ADM-004 | P0 | AW market/zone | /v1/admin/markets/zones | Closed zone reflected |
| ADM-005 | P0 | AW order table/detail | GET /v1/admin/orders* | Paging, timeline, receipt |
| ADM-006 | P0 | AW dispatch | POST /assign or /reassign | Concurrent conflict |
| ADM-007 | P0 | AW partners | /v1/admin/partners* | Approval/suspend |
| ADM-008 | P0 | AW support | /resolve-exception, /support/tickets | Reason and history |
| ADM-009 | P0 | AW finance | GET /v1/admin/finance/* | Separate money dimensions |
| ADM-010 | P0 | AW audit | GET /v1/admin/audit | Actor/reason/timestamp |
| ADM-011 | P1 | AW promotions | Future promotion endpoints | Rule boundaries |
| ADM-012 | P1 | AW reports | GET /v1/admin/reports/orders | Filter/export permissions |

## 5. Backend cross-cutting requirements

| PRD ID | Priority | Backend module | Core invariant / test |
|---|---|---|---|
| BE-001 | P0 | identity/auth | Customer/partner/admin ownership and role |
| BE-002 | P0 | checkout/quote | Integer paise/price snapshot |
| BE-003 | P0 | orders | Allowed transitions and event version |
| BE-004 | P0 | dispatch | Mongo atomic partner/offer assignment |
| BE-005 | P0 | shopping | Approved substitute version |
| BE-006 | P0 | payments/finance | Signed webhook, dedup, no double refund |
| BE-007 | P0 | order_events/outbox | Reconnect GET, duplicate event ignored |
| BE-008 | P0 | notifications | FCM retry/job idempotency |
| BE-009 | P0 | middleware/audit | Validation, rate, redaction, permission |
| BE-010 | P0 | ops/backup | Restore drill and alert |
| BE-011 | P0 | Redis/BullMQ | Cache invalidation, OTP rate limits, worker restart/outbox replay |

## 6. Cross-cutting E2E trace

| Scenario | CM | PM | CW | AW | BE |
|---|:---:|:---:|:---:|:---:|:---:|
| COD order creation/retry | ✓ | — | ✓ | View | ✓ |
| Local market availability | Browse | Visit | Browse | Edit | ✓ |
| Partner assignment | Track | Accept | Track | Assign | ✓ |
| Substitution | Decide | Request | Decide | Review | ✓ |
| Receipt evidence | View summary | Upload | View summary | Inspect | ✓ |
| Delivery OTP | Status | Verify | Status | Inspect | ✓ |
| Payment pending/refund | Status | — | Status | Finance | ✓ |
| No-partner exception | Status | — | Status | Resolve | ✓ |
| Redis outage | Degraded UX | Degraded UX | Degraded UX | Alert | Recovery |
| Authorization/PII | Own data | Assigned job | Own data | RBAC | Enforced |

## 7. Traceability completion rules

- Every **P0** row must map to at least one automated integration/contract test and an accepted UAT scenario.
- Every sensitive backend action must include authorization, audit and failure/rollback tests.
- P1 is excluded from initial launch acceptance unless promoted through an approved change.
- A visually represented screen does not count as “implemented” until its live route, error state, API and end-to-end acceptance pass.
- API path strings are proposed draft names; checked-in OpenAPI becomes authoritative once generated/reviewed.

