# HaatGo — Product Requirements Document (PRD)

**Version:** 1.0 — implementation baseline / review draft  
**Date:** 14 November 2026 (IST)  
**Product:** Indian hyperlocal market-shopping and doorstep-delivery platform  
**Surfaces:** Customer Android app, delivery-partner Android app, responsive customer website, operations/admin website, shared backend  
**Initial operating assumption:** Kolkata pilot, curated catalogue, one local market per order, one partner purchases and delivers  
**Context:** Client's earlier MVP quotation was ₹85,000 including one year of server/domain and three months of post-launch support. This PRD controls scope but does not promise those features are feasible at that fixed price without final sign-off.

## 1. Executive summary

HaatGo enables customers to order groceries and essentials from nearby existing markets, without the platform operating its own dark store. A delivery partner accepts an order, travels to an assigned local market, buys the requested items, and delivers to the customer. Customers see meaningful order stages; admin staff manage products, local markets, delivery coverage, orders, exceptions, partner availability, and reconciliation.

**Positioning:** “Your local market, delivered home.” The name HaatGo is a *working UI concept*, not a finalized legal/brand decision. Do not publish it without client sign-off and clearance.

### 1.1 Business objectives

| ID | Objective | MVP interpretation |
|---|---|---|
| BO-01 | Validate local demand | Launch in a small, configured service zone |
| BO-02 | Accept customer orders | Android app + responsive customer web |
| BO-03 | Fulfill without a warehouse | Partner shops at local market, then delivers |
| BO-04 | Reduce operational chaos | Admin sees orders, assignments, exceptions, receipts |
| BO-05 | Control cost | Single backend, manual fallback, no microservices |
| BO-06 | Support initial volume | Plan around ~1,000 orders/month, not million-user infrastructure |

### 1.2 What success means

Proposed pilot KPIs (targets require client validation):

- Order placement success ≥ 98% of valid checkout attempts excluding payment-provider outages.
- No duplicate orders from a single idempotent checkout retry.
- ≥ 95% orders have a clearly recorded partner assignment outcome.
- 100% delivered orders have an auditable completion event.
- ≥ 95% of customer-visible order stage updates appear within 15 seconds of backend state change while online.
- All price changes, unavailable items, manual dispatch overrides and refunds have an audit trail.
- Operational measures: order completion rate, median delivery time, substitution incidence, cancellation/refund rate, gross margin after market purchase, rider utilization, support tickets.

These are suggested acceptance targets; neither delivery-time SLAs nor profitability can be guaranteed in this document.

## 2. User roles and personas

| Persona | Goals | Pain points | Device |
|---|---|---|---|
| Customer | Quickly buy vegetables, staples, eggs and essentials locally | Uncertain stock, opaque pricing, delivery status | Android / mobile browser |
| Delivery partner | Understand assignment, shop accurately, finish quickly | Bad directions, missing products, unclear reimbursement | Android |
| Dispatcher/admin | Track every order and fix problems | Manual calling, poor visibility, duplicate assignments | Desktop web |
| Catalogue operator | Maintain curated prices, categories, service zones | Rapid local price changes, inconsistent units | Desktop web |
| Support/finance operator | Explain adjustments, payments, refunds, payouts | Missing audit evidence and receipt matching | Desktop web |

MVP can combine the admin roles into one controlled administrator account, but API permissions must be designed to support separation later.

## 3. Scope by release priority

**P0** = required for launch; **P1** = desirable only if time remains; **P2** = later phase.

| Domain | P0 | P1 | P2 / excluded at launch |
|---|---|---|---|
| Identity | Phone OTP, customer + partner accounts, admin credentials | Referral code | Social login, complex loyalty tiers |
| Discovery | Location/pincode, serviceability, curated categories, search | Sort/filter refinements | Personalized AI recommendations |
| Commerce | Product details, quantity, cart, address, quote, checkout | Basic coupon | Wallet, subscriptions, recurring orders |
| Payment | COD, online gateway only when live account/contract confirmed | Automated partial refunds | BNPL, saved cards, in-app wallet |
| Fulfillment | Single market per order, one partner buys & delivers | Multiple eligible market fallback | Split orders across shops |
| Dispatch | Nearby available rider offer, accept/decline, expiry, admin override | ETA-aware ranking | ML routing / batch orders |
| Shopping | Checklist, unavailable flags, substitutions with approval, receipt image | Barcode/photo catalog matching | Merchant stock sync / POS |
| Tracking | Stage progression, ETA text, partner details after acceptance | Map location when valid location consent exists | Guaranteed continuous turn-by-turn tracking |
| Customer support | Call/WhatsApp/help entry, ticket record in admin | In-app chat | Voice/video calling |
| Admin | Catalogue, zones, orders, riders, fees, support, finance summaries | Banner/coupon management | Marketplace seller portal |
| Analytics | Basic orders, GMV, fees, cancellation and rider stats | Cohorts, retention dashboards | Data warehouse/BI suite |

**Web requirement:** customer storefront and admin are **two separate React websites**. Both use React + TypeScript + shadcn/ui + Tailwind + Redux/Redux Toolkit + Redux Persist + Redux Saga + Axios.  
**Mobile requirement:** customer and partner apps are **two separate bare React Native Android projects; no Expo**, using **React Native Paper (MD3), Redux/Redux Toolkit, Redux Persist, Redux Saga and Axios**, entirely in TypeScript.  
**Backend requirement:** **Express.js + TypeScript + MongoDB + Redis** in a modular monolith. Redis is part of the confirmed backend stack for cache, rate limiting, BullMQ job queues and relevant realtime coordination; MongoDB remains authoritative for orders and money. **Every frontend, backend module and worker uses TypeScript.**

**Repository requirement (15 November 2026):** five separate repositories for backend,
admin web, customer web, customer Android and driver Android. Each owns its source,
node_modules, package manifest, lockfile, tests, configuration and release. No shared
runtime code/packages or sibling imports. Only local contract/token/reference copies
connect the repos in this workspace. Backend contract/source changes require impact
review across all clients, with explicit behavior changes and acceptance evidence.

### Local implementation override ? 15 November 2026

The user requested a dummy login OTP, OpenStreetMap, dummy data for other providers, environment files in each project, and integration/smoke/E2E tests. The local implementation uses OTP 123456 and delivery OTP 654321. Simulated online payments are available only in development; no SMS, push or bank transaction is sent. Real providers, business approvals and production release gates remain separate.

## 4. Operating assumptions and constraints

1. A single order is fulfilled at one selected market, by one delivery partner, with no merchant application in P0.
2. Products are **orderable catalogue entries**, not real-time warehouse stock. “Available” means the platform accepts an attempted market purchase; a partner can still report missing stock.
3. Initial pricing model proposed: customer sees **fixed, server-calculated selling prices** at checkout. Actual market purchase costs are internal and may differ; they do not silently change customer totals.
4. A different substitute can be offered only under a defined approval rule. Default P0 policy: substitution with the same or lower customer selling price; higher-priced substitutions require explicit extra payment flow and are excluded from standard P0 path.
5. Delivery radius, market hours, rider coverage, delivery fees and ETA calculation are configurable per zone, not hardcoded.
6. COD works only if cash collection and purchase-funding responsibilities are explicitly defined. “Rider buys at market” does not implicitly mean rider personally finances stock.
7. Customer must be able to place an order even if they deny device GPS access, by manually entering a deliverable address/pincode.
8. Customer web and Android app use the same account, cart reconciliation strategy, orders, product pricing and APIs.
9. UI concept images show illustrative data; they are not requirements for exact promises, city pins, discounts, merchant names or metrics.
10. One year of basic hosting/domain and three months of defect support were in the earlier commercial quotation; SMS, maps, gateway fees, OTP credits and transaction charges must be commercially clarified.

## 5. End-to-end journey

~~~mermaid
flowchart TD
    A["Customer selects delivery zone"] --> B["Browse curated local catalogue"]
    B --> C["Cart and server quote"]
    C --> D["Place order / confirm payment"]
    D --> E["Select market and offer to partner"]
    E --> F["Partner shops at market"]
    F --> G{"Unavailable item?"}
    G -->|No| H["Confirm purchase and receipt"]
    G -->|Yes| I["Approve substitute or remove item"]
    I --> H
    H --> J["Partner delivers and verifies OTP"]
    J --> K["Complete order and reconcile"]
~~~

### 5.1 Customer journey details

- Launch → location (device permission optional) → serviceability check.
- Home/catalogue → category/search → product detail → add quantity.
- Cart → authoritative quote with item units, fees and expiry.
- Address confirmation → COD/online payment choice → place order with idempotency key.
- Confirmation displays order ID and initial status. Tracking has “finding partner,” “shopping at market,” “out for delivery,” and “delivered.”
- When a requested item is missing, customer sees proposed substitute or removal. Pending decisions show a deadline and fallback.
- Delivered order appears in history with final receipt summary and support path.

### 5.2 Partner journey details

- Verify phone and approval status → go online → heartbeat + consented location update.
- Receive one actionable offer showing market, broad destination area, expected workload, compensation and timeout.
- Accept → navigate to market → item-by-item checklist; mark bought/unavailable.
- On unavailable item, propose eligible substitute and await customer/admin decision.
- Record actual quantity/cost, upload market receipt, confirm shopping.
- Navigate to address → verify delivery OTP or approved fallback → complete and view earnings entry.

### 5.3 Admin journey details

- Login → inspect orders and availability → maintain products and zones.
- New order automatically tries dispatch; dispatcher may reassign with reason.
- Exceptions are visible: no rider, item missing, customer unreachable, payment pending, delivery failure.
- Receipt and actual purchase values are retained for reconciliation.
- Finance/support can review payment, refunds, COD collection, rider reimbursement, and audit events.

## 6. Functional requirements — customer experience

### 6.1 Authentication, location, profile

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| CUS-001 | P0 | +91 phone OTP login | Valid OTP authenticates; invalid/expired OTP has clear retry/resend flow; OTP rate limited |
| CUS-002 | P0 | Manual location | Customer can enter six-digit PIN code/address without granting GPS |
| CUS-003 | P0 | Serviceability validation | Unsupported zone prevents checkout; browse may remain available with notice |
| CUS-004 | P0 | Saved addresses | User can create/edit/select address with house, street, landmark, PIN and instructions |
| CUS-005 | P0 | Profile | Display/edit name and basic contact; logout clears sensitive state |
| CUS-006 | P1 | Multi-language UI | English default; structured keys for Bengali/Hindi future localization |

### 6.2 Catalogue, search and cart

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| CUS-010 | P0 | Browse categories | Curated categories, active products and correct selling prices |
| CUS-011 | P0 | Search | Case-insensitive text search on names, synonyms/aliases, limited result list |
| CUS-012 | P0 | Product detail | Price, unit, photo, description, orderability, min/max quantity |
| CUS-013 | P0 | Add/remove quantity | State matches backend, no negative or out-of-bound quantity |
| CUS-014 | P0 | Cart | Items, quantities, subtotals, fee preview, delete and empty state |
| CUS-015 | P0 | Availability disclaimer | No claim of guaranteed market stock; item issue handled in fulfillment |
| CUS-016 | P1 | Catalogue filters | Category, price band, sort |
| CUS-017 | P1 | Basic offers | Validity, per-user limits and server-enforced discount calculations |

### 6.3 Checkout and order tracking

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| CUS-020 | P0 | Server quote | Quote includes item snapshot, unit, quantities, delivery fee, discounts, total and expiry |
| CUS-021 | P0 | Place order | Requires serviceable address and valid quote; repeated same idempotency key returns same order |
| CUS-022 | P0 | COD | Payment method shown only where zone/policy permits |
| CUS-023 | Conditional P0 | Online payment | Enabled only after gateway setup, signed payment verification and refund policy; otherwise feature-flagged off |
| CUS-024 | P0 | Order confirmation | Stable order ID, status and access to tracking |
| CUS-025 | P0 | Order history/detail | Customer sees only own orders with stages, total and receipt summary |
| CUS-026 | P0 | Substitution decision | Customer can approve/reject proposed item and sees any price delta before confirming |
| CUS-027 | P0 | Support | Contact/help entry and issue reference; human operations fallback |
| CUS-028 | P0 | Cancellation | Server enforces configured cancellation cutoff and refund implications |
| CUS-029 | P1 | Live map | Show partner location only during relevant delivery stage with valid consent |

## 7. Functional requirements — delivery-partner app

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| PAR-001 | P0 | Partner OTP + approval | Unapproved/suspended account cannot receive offers |
| PAR-002 | P0 | Availability toggle | Backend reflects online/busy/offline; offline partner cannot receive offers |
| PAR-003 | P0 | Offer accept/decline | Server rejects expired/previously accepted offers |
| PAR-004 | P0 | Market navigation | Shows approved market and opens installed map application |
| PAR-005 | P0 | Shopping checklist | Every order item has quantity and bought/missing state |
| PAR-006 | P0 | Missing-item workflow | Customer approval sought; partner cannot silently change item |
| PAR-007 | P0 | Purchase proof | Actual quantity/market cost and readable receipt image submitted |
| PAR-008 | P0 | Delivery navigation | Partner sees address and instructions after acceptance |
| PAR-009 | P0 | Delivery proof | OTP verified server-side or supervisor-approved fallback |
| PAR-010 | P0 | Earnings history | Uses backend payout ledger, not local calculations |
| PAR-011 | P1 | Background location | Only with separate Android permission/consent requirements and review |

## 8. Functional requirements — admin website

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| ADM-001 | P0 | Secure admin login | Role-checked server sessions, protected routes and audit |
| ADM-002 | P0 | Dashboard | Current counts for placed, shopping, out-for-delivery, completed, cancelled |
| ADM-003 | P0 | Catalogue CRUD | Category, unit, photo, customer price, per-zone orderability, archive |
| ADM-004 | P0 | Market/zone CRUD | Market coordinates, operating hours, service area, fees, active status |
| ADM-005 | P0 | Order workbench | Search/filter, order detail, timeline, receipt, payment status |
| ADM-006 | P0 | Dispatch control | View offers, available riders; manual reassignment with reason |
| ADM-007 | P0 | Partner management | Approve/suspend, see availability and active task |
| ADM-008 | P0 | Exceptions/support | Resolve no-rider, unavailable item, unreachable customer, failure |
| ADM-009 | P0 | Finance summary | Item quote, actual purchase cost, delivery fee, COD/online, refund/payout statuses |
| ADM-010 | P0 | Audit log | Actor/time/before-after for sensitive admin actions |
| ADM-011 | P1 | Coupon/banner module | Create/disable with constraints |
| ADM-012 | P1 | Analytics exports | CSV by date, zone, market, status |

## 9. Functional requirements — backend/platform

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| BE-001 | P0 | Auth/role layer | Customer/partner/admin role checks on every protected operation |
| BE-002 | P0 | Quote engine | Integer paise; pricing snapshot; delivery/fee rules server-side |
| BE-003 | P0 | Order state machine | Illegal transition rejected, changes recorded once |
| BE-004 | P0 | Dispatch engine | Geo candidate selection, configurable timeout, atomic offer/accept, manual fallback |
| BE-005 | P0 | Shopping change control | Approved substitutions/removals tied to order version |
| BE-006 | P0 | Payment ledger | COD and online reconciled, gateway events deduplicated |
| BE-007 | P0 | Order events | Persist event and return current state on reconnect |
| BE-008 | P0 | Notifications | Push for meaningful milestones and action-required requests |
| BE-009 | P0 | Audit/security | Rate limiting, secrets isolation, input validation, PII-safe logging |
| BE-010 | P0 | Backups/recovery | Scheduled DB backup, documented restore drill |
| BE-011 | P0 | Redis layer | Redis-backed cache, OTP/rate-limit counters, BullMQ workers, monitored health and recovery |

## 10. Business rules

### 10.1 Catalogues and pricing

- Each SKU has display name, aliases, category, unit, pack size, image, zone/market availability flags, selling price in paise, max order quantity, active state.
- Market prices may change. The **customer-facing quote** is based on the platform selling price, not a later unapproved market receipt amount.
- Receipt cost difference impacts platform margin and rider reimbursement, not a silent customer charge.
- All promotions and delivery fees are recomputed server-side; frontend totals are informative only.
- Failed quote validation returns which lines changed and a replacement quote before order placement.

### 10.2 Serviceability and market assignment

- Customer location must match an active delivery zone with an open eligible market.
- Initial market-selection order: zone-configured primary market; if closed/unavailable, optional fallback markets only if explicitly enabled.
- One market per order at P0. If one order requires multiple markets, reject unsupported combination or route to support; do not silently create split fulfillment.

### 10.3 Dispatch

- Suggested configurable policy: find approved available partners near selected market (initially within 2 km); rank by distance/ETA, send one expiring offer at a time (illustrative 20-second timeout); widen to 5 km if needed.
- A partner has at most one active shopping/delivery order in P0.
- Server must atomically claim partner/offer. The first valid accept wins; stale accepts return conflict and do not assign.
- When none accepts, order becomes “assignment pending / needs manual dispatch,” customer receives an honest delay status.
- Admin reassignment requires explicit reason and releases old assignment safely.

### 10.4 Out-of-stock and substitution

- Partner marks missing item with reason.
- System proposes known SKU and compares customer-selling prices; customer accepts/rejects.
- P0 default: allow same-price or cheaper substitute; higher-price request requires separate, intentionally designed payment/consent flow (not assumed).
- On timeout/rejection, remove the item or escalate to admin based on rule. If prepaid, queue the verified refund of any overpayment.
- Never treat “proposed” as “purchased”; receipt captures the actual purchased SKU and quantity.

### 10.5 COD, prepaid and settlement

- COD cash collection must be captured as a distinct recorded event; customer total, amount received, and cash settlement are separate values.
- If prepaid payment is pending, order must not enter fulfillment until payment is confirmed or configured risk policy explicitly allows it.
- Payment success is confirmed server-side (signature/webhook/API), never merely by browser/app callback.
- Purchase cost (local market), customer revenue, partner payout and gateway fee are **different ledger dimensions**.
- Refunds and rider purchase reimbursements require defined responsibility and manual/automated approval rules.

### 10.6 Delivery verification

- OTP is specific to order and expires; partner cannot generate/validate it locally.
- Network outage at doorstep requires supervisor-reviewed fallback; store evidence without storing excessive customer PII.
- Only backend can mark order delivered and record delivery timestamp.

## 11. Non-functional requirements

| Dimension | Proposed MVP requirement |
|---|---|
| Availability | Target 99.5% monthly API availability excluding planned maintenance; alert on sustained failures |
| Capacity | Base sizing for 1,000 orders/month; burst test at ≥ 10 concurrent checkouts and ≥ 30 connected live clients; Mongo/Redis memory observed |
| API latency | Target p95 < 500 ms for indexed catalogue reads under pilot load (excluding gateway/maps calls) |
| Checkout reliability | All writes idempotent where retries are likely |
| Data integrity | No duplicate order from retries, no double rider assignment, no double refund |
| Connectivity | Apps show useful cached order state and explicit stale/offline banner |
| Security | HTTPS/TLS, server validation, RBAC, scoped data access, logs without OTP/tokens/card data |
| Accessibility | WCAG 2.2 AA target for web; Android font scaling, talkback, >=48dp tap targets |
| Observability | Request ID, structured logs, alerts, provider failure dashboards, order state audit |
| Recovery | Daily Mongo backup minimum and one documented restoration test; Redis job recovery and outage runbook |
| Privacy | Collect minimum personal data; retention/deletion policy reviewed for India compliance |
| Localization | INR, +91, Indian PIN codes, Asia/Kolkata display times, future Bengali/Hindi capability |
| Hosting | Cost-controlled VPS with MongoDB + Redis, separated staging/production config and private network binding |

## 12. Exception and recovery matrix

| Scenario | Customer | Partner | Admin/backend |
|---|---|---|---|
| GPS permission denied | Manual pincode/address | Manual map navigation if permitted | No hidden failure |
| Market closed | Clear unserviceable notice | No offer issued | Mark market hours |
| Product missing | Approve replacement/removal | Request approval, wait | Escalation and audit |
| No partner accepts | “Finding partner / delayed” | No duplicate offers | Retry radius/queue/manual assignment |
| Partner loses network | Stage remains last confirmed | Offline banner/queued shopping draft | Detect stale heartbeat |
| OTP delayed | Resend with cooldown | Same | Rate limit and provider retry |
| Payment pending | Show processing; block duplicate payment | No job until confirmed | Reconcile via webhook/status |
| Payment callback lost | Poll order/payment status | N/A | Idempotent payment reference |
| Order cancelled mid-shop | Show eligible refund policy | Stop/return instructions | Manual settlement exception |
| Customer unavailable | Contact and support route | Cannot bypass OTP | Fail/reschedule/cancel policy |
| Refund failure | “Refund pending” with reference | N/A | Retry/manual finance queue |
| Duplicate socket event | One visible stage | One task progression | Event ID/version guard |

## 13. Screens and visual traceability

The separate HaatGo UI Design Kit contains 44 **concept** frames:

- Customer Android discovery: 8.
- Customer Android purchase/account: 8.
- Delivery-partner Android: 10.
- Customer website: 8.
- Admin website: 10.

These are **not** 44 fully production-specified route files. Combined “orders/profile/help,” “payments/analytics/settings,” and similar contact-sheet frames split into distinct functional routes where required. See each TAD for actual route inventory and UI states.

Shared design tokens: green brand #168B56; accessible CTA green #0E7547; saffron #F6A21B; ivory #FFF9F1; ink #1C312C. Use the design-system Markdown in the UI kit and the reference copy included in this documentation bundle.

## 14. Phase plan and measurable exit gates

Dates below are **planning estimates**, not a confirmed contract. For one developer and four frontends, an 8-week deadline at ₹85,000 is high risk; a lean MVP should be agreed in writing.

| Stage | Work | Exit gate |
|---|---|---|
| 0. Discovery (3–5 days) | Freeze pricing, payments, markets, zone, rider funding, brand, P0 | Signed decisions and acceptance criteria |
| 1. Foundation (1–2 weeks) | Repo, auth, data models, CI, design tokens, core admin catalogue | End-to-end auth and editable catalogue |
| 2. Commerce (2 weeks) | Mobile/web browsing, cart, addresses, quote, checkout | COD order from both customer clients |
| 3. Fulfillment (2 weeks) | Rider app, dispatch, shopping, receipt, OTP delivery | Full pilot order delivered |
| 4. Operations (1–2 weeks) | Admin workbench, audit, exception handling, payments as approved | Incident/edge-case UAT |
| 5. Hardening (1–2 weeks) | Device QA, backups, metrics, performance, Play/hosting readiness | Release checklist passed |

**Commercial control:** New flows such as multi-vendor shopping, wallet, complex offers, iOS, merchant portals or 10-minute guaranteed delivery require a change request. Costs for SMS OTP, maps APIs, payment processing, gateway refunds, external messaging and store accounts are not automatically absorbed in the earlier quote without contract wording.

## 15. UAT scenarios (Gherkin-style)

**UAT-01 Customer order via Android**
- Given a customer has a serviceable address and one active product;
- when they confirm a valid COD quote;
- then exactly one order is created and visible in Orders and admin.

**UAT-02 Same request retried**
- Given the checkout request reached the server but client timed out;
- when the customer retries with the same idempotency key and payload;
- then the server returns the original order, not a new order.

**UAT-03 Customer web parity**
- Given customer orders on web using the same account;
- when they open Android Orders;
- then order ID, amount and stage match.

**UAT-04 Competing accept**
- Given an offer has expired or another partner has claimed the job;
- when a stale partner attempts accept;
- then the server rejects with 409 and leaves assignment unchanged.

**UAT-05 Substitute**
- Given partner reports an item out of stock;
- when customer rejects the alternative;
- then the partner checklist reflects removal and final payment/refund rules are applied.

**UAT-06 Payment callback failure**
- Given gateway payment succeeded but frontend was terminated;
- when the verified webhook or reconciliation callback arrives;
- then the order advances once and the client retrieves correct status.

**UAT-07 Delivery evidence**
- Given partner enters the correct order OTP;
- when backend verifies it;
- then order marks delivered exactly once with timestamp and partner ID.

**UAT-08 Unauthorized access**
- Given a customer or unrelated rider requests another order's details;
- then backend returns a permission error and emits no sensitive data.

**UAT-09 Admin dispatch**
- Given automatic assignment exhausted candidates;
- when authorized dispatcher chooses a valid available rider with reason;
- then assignment becomes active with audit entry and customer stage updates.

**UAT-10 Offline rider**
- Given partner loses connectivity while shopping;
- when network returns;
- then pending checklist changes reconcile safely without duplicate completion.

## 16. Dependencies, risks and decisions

### 16.1 Launch dependencies

- Client legal/merchant account, operating entity and final brand.
- Delivery zones/markets and real product price list with photos and units.
- Named responsible operations person for shopping exceptions and refunds.
- OTP provider account, official payment gateway if online is required, map API credentials if maps are enabled.
- Android publishing account(s), privacy policy, customer support channel, rider onboarding agreement.
- Definition of cash collection and purchase-funding/reimbursement flow.

### 16.2 Major risks

| Risk | Impact | Mitigation |
|---|---|---|
| Fresh market stock is not predictable | Cancellations, substitutions | Set expectations; approval workflow and fast escalation |
| Rider purchasing funds undefined | Insolvency/operational dispute | Sign off funding and settlement ledger before launch |
| ₹85k budget vs four clients | Incomplete quality/support | Strict P0 freeze, phased online payments and no P1 |
| COD fraud/cash leakage | Financial loss | OTP, daily reconciliation and operator controls |
| Poor network in markets | Duplicate states | Draft queue, idempotency and reconnect fetch |
| Provider costs and quotas | Surprise fees/outages | Budget caps, usage alerts and fallback modes |
| Real-time map assumptions | Privacy/cost issues | Stage tracking first, optional map with consent |

### 16.3 Open decisions requiring client sign-off

| ID | Decision | Recommended P0 default | Owner |
|---|---|---|---|
| DEC-01 | Final name/brand | HaatGo placeholder until approved | Client |
| DEC-02 | Selling-price model | Fixed curated selling price at checkout | Client/operations |
| DEC-03 | Market per order | One assigned market | Operations |
| DEC-04 | Higher-price substitutions | Exclude from P0; no surprise surcharge | Client/finance |
| DEC-05 | Payment methods | COD first, online behind ready/verified integration | Client/finance |
| DEC-06 | Purchase funding | Explicit company float or verified rider reimbursement | Client/finance |
| DEC-07 | Zone, hours and ETA | Configurable with conservative estimates | Operations |
| DEC-08 | Cancellation/refund rules | Written policy prior to checkout launch | Client/legal |
| DEC-09 | Customer support | Published help channel + admin ticket log | Client |
| DEC-10 | Hosting/SMS/maps fees | Separate recurring-cost schedule and caps | Client/developer |
| DEC-11 | iOS | Out of initial scope; Android only | Client |
| DEC-12 | MVP dates/scope | Gate launch on UAT, not mockup completion | Client/developer |

## 17. Sign-off and change management

Status remains **draft** until client and engineering sign off DEC-01–DEC-12. Any change to pricing, number of fulfillment actors, payment capture, multi-market sourcing, or post-launch support affects architecture, QA and cost. Capture agreed change in a versioned decision log; revise affected TADs and acceptance tests.

## 18. Related documents

- [TAD — Customer Android](TAD_01_CUSTOMER_ANDROID.md)
- [TAD — Delivery Partner Android](TAD_02_DELIVERY_ANDROID.md)
- [TAD — Customer Website](TAD_03_CUSTOMER_WEB.md)
- [TAD — Admin Website](TAD_04_ADMIN_WEB.md)
- [TAD — Backend](TAD_05_BACKEND.md)
- [Traceability Matrix](TRACEABILITY_MATRIX.md)
- [Design System Reference](references/DESIGN_SYSTEM.md)

