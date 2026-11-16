# HaatGo — Architecture Decision and Open-Question Log

**Version:** 1.0 draft · **Date:** 14 November 2026  
**Legend:** **LOCKED** = explicitly directed by user; **PROPOSED** = engineering recommendation; **OPEN** = requires client/operations decision; **DEFERRED** = beyond P0.

## 1. Locked technology decisions

| ID | Status | Decision | Consequence |
|---|---|---|---|
| TECH-01 | **LOCKED** | React for both websites | Separate customer/admin React builds |
| TECH-02 | **LOCKED** | shadcn/ui for web | Tailwind/shadcn reusable web components |
| TECH-03 | **LOCKED** | Redux, Redux Persist, Redux Saga, Axios for web | One predictable async/store/data-access pattern |
| TECH-04 | **LOCKED** | Bare React Native, **not Expo** | Native Android Gradle projects and RN CLI |
| TECH-05 | **LOCKED** | React Native **Paper UI** for mobile | MD3 PaperProvider themes and Paper components |
| TECH-06 | **LOCKED** | Redux, Redux Persist, Redux Saga, Axios for mobile | Shared state/async concepts, separate native storage |
| TECH-07 | **LOCKED** | Backend **Express.js** | Typed Express module/router layering |
| TECH-08 | **LOCKED** | Backend **MongoDB** | Persistent domain data, geospatial queries, versioned transitions |
| TECH-09 | **LOCKED** | Backend **Redis** | Cache, shared throttling, BullMQ jobs, internal coordination |
| TECH-10 | **LOCKED** | **TypeScript throughout apps and services** | Repo-local DTO declarations, types, workers and domain validation |
| TECH-11 | **PROPOSED** | Vite for both web builds | Simple static SPA deployment |
| TECH-12 | **PROPOSED** | BullMQ on mandatory Redis | Delayed dispatch, reconciliation, push retries |
| TECH-13 | **PROPOSED** | Socket.IO + FCM | Order stages, rider events, notifications |
| TECH-14 | **PROPOSED** | MongoDB replica set | Cross-document transactions for assignments and ledger |
| TECH-15 | **PROPOSED** | Single VPS pilot | Must handle Mongo, Redis and two TS processes reliably |
| TECH-16 | **LOCKED** | Five independent repositories (15 November 2026) | Backend, admin web, customer web, customer Android, driver Android; own source/dependencies/lockfiles/releases; no shared node_modules/code/packages |
| TECH-17 | **LOCKED** | Local coordination only (15 November 2026) | Owned contract/token/reference snapshots; no sibling imports or links; impact review and tests for backend changes across every client |
| TECH-18 | **LOCKED** | Local dummy providers (15 November 2026) | User requested fixed dummy login OTP and dummy data for other integrations; local OTP 123456, delivery OTP 654321; simulated payments/SMS/notifications; production remains disabled |
| TECH-19 | **LOCKED** | OpenStreetMap (15 November 2026) | Web maps and native OpenStreetMap views/search, contributor attribution; sample foreground partner coordinates are clearly identified |
| TECH-20 | **LOCKED** | Environment and application tests (15 November 2026) | Every repo owns environment examples and local environment files; integration, smoke and E2E checks accompany the implementation |
| TECH-21 | **LOCKED** | Real Cloudinary catalogue media (user request) | Reuse the existing Pother Sathi upload preset through backend-only configuration; dedicated haatgo/products, haatgo/categories and haatgo/sections folders; public catalogue assets only; fixed OTP/payments/notifications remain dummy |

The local dummy-provider decision authorizes development and testing. It does not
approve production OTP/gateway accounts, financial policies, real background GPS,
release signing, public deployment, or the legal brand. These remain separate
operational acceptance items below.

**Native exception:** Android native scaffolding/integration files may be Kotlin/Java/Gradle because React Native CLI requires native platform projects; **all product/application/backend/worker logic remains TypeScript**.

## 2. Open operational/product decisions

| ID | Status | Decision needed | P0 recommended baseline | If changed |
|---|---|---|---|---|
| DEC-01 | OPEN | Legal brand and app IDs | HaatGo is placeholder only | Redesign assets, domains and package names |
| DEC-02 | OPEN | Selling prices | Fixed curated customer prices at checkout | Dynamic pricing requires adjustments and more consent |
| DEC-03 | OPEN | Market model | One market per order | Multi-market split changes dispatch and finance |
| DEC-04 | OPEN | Fulfillment actors | One partner shops and delivers | Two-person shopping/courier model changes app state |
| DEC-05 | OPEN | Out-of-stock rules | Same/lower-price substitute with consent; otherwise remove/refund | Higher prices require incremental payment workflow |
| DEC-06 | OPEN | Payment methods | COD first; prepaid only after verified gateway ready | More settlement/failure cases |
| DEC-07 | OPEN | Purchase funding | Defined company float or reimbursed partner expense | Cannot launch without funding responsibility |
| DEC-08 | OPEN | COD handling | Partner collects, admin reconciles remittance | Other operator changes ledger |
| DEC-09 | OPEN | Rider payout | Per-order formula configured by zone | Earnings and settlement screens change |
| DEC-10 | OPEN | Delivery zone/fees | Limited pilot zones, configurable fee & hours | Wider radius affects dispatch and ETA |
| DEC-11 | OPEN | ETA promise | Conservative dynamic estimate, no 10-minute guarantee | Aggressive promise requires measured operations |
| DEC-12 | OPEN | OTP/payment/map providers | Choose budgeted India-compatible vendors | Native and server adapters change |
| DEC-13 | OPEN | Customer support | Human help channel and ticket log | In-app chat adds cost |
| DEC-14 | OPEN | Refund/cancellation | Stage-based written policy with finance approval | Extra payment and admin states |
| DEC-15 | OPEN | Rider location policy | Foreground permissioned in P0 | Background service/Play review effort |
| DEC-16 | OPEN | Delivery OTP fallback | Supervisor-reviewed incident override | Fraud and dispute risk |
| DEC-17 | OPEN | Hosting/backup spend | VPS sized for Mongo+Redis + off-host backups | May require separate infrastructure |
| DEC-18 | OPEN | Release schedule | Gated P0/QA rollout, avoid fixed unsupported date | Scope/milestone changes |
| DEC-19 | OPEN | Commercial exclusions | Provider fees & usage explicitly agreed | Potential recurring cost disputes |
| DEC-20 | OPEN | Admin identity | Restricted admin login, MFA preferred | Financial actions carry more risk |

## 3. Deferred features

| ID | Status | Feature | Why deferred |
|---|---|---|---|
| P2-01 | DEFERRED | Multi-shop simultaneous sourcing | Requires multi-partner/split fulfillment |
| P2-02 | DEFERRED | Merchant-owned inventory portal | New actors and stock sync |
| P2-03 | DEFERRED | Guaranteed ten-minute delivery | Operational infrastructure not present |
| P2-04 | DEFERRED | AI product recommendation/routing | No MVP necessity |
| P2-05 | DEFERRED | Wallet/loyalty/subscriptions | Additional accounting and compliance |
| P2-06 | DEFERRED | iOS release | Separate build/test/store track |
| P2-07 | DEFERRED | Rider batch routing | Dispatch/settlement complexity |
| P2-08 | DEFERRED | In-app customer/partner chat | Privacy/moderation/cost burden |
| P2-09 | DEFERRED | Advanced promo/referral engine | Additional pricing abuse scenarios |

## 4. Immediate client decisions in dependency order

1. **DEC-02, DEC-03, DEC-04:** settle how catalogue, market and partner fulfillment work.
2. **DEC-07, DEC-08, DEC-09:** define who pays at market, how COD returns, how rider is reimbursed/paid.
3. **DEC-05, DEC-14:** define substitutions, partial cancellation and money adjustments.
4. **DEC-06, DEC-12:** decide whether online payment is a launch feature, and provider accounts.
5. **DEC-10, DEC-11, DEC-15:** confirm service radius, hours and tracking permissions.
6. **DEC-01, DEC-13, DEC-16–20:** branding, support, risk and operational handoff.

## 5. Change-request rule

Any OPEN decision that alters money, number of fulfillment actors, number of markets per order, rider role, refund logic or payment method must:

1. Update the PRD business rule and affected P0/P1 priority.
2. Update backend state machine, API DTO and data models.
3. Update every client TAD that consumes changed states.
4. Update the traceability matrix and acceptance scenarios.
5. Obtain revised schedule/price approval before implementation.

## 6. Sign-off sheet

| Role | Name | Date | Confirmation |
|---|---|---|---|
| Client product owner | TBD | TBD | Open operational decisions |
| Operations owner | TBD | TBD | Market, rider, COD and fulfillment policy |
| Finance owner | TBD | TBD | Payments, reimbursements, refunds |
| Engineering owner | TBD | TBD | TypeScript architecture, P0 scope, feasibility |
| Test/UAT owner | TBD | TBD | End-to-end acceptance scenarios |

This document records decisions and uncertainties; it does **not** imply that open business rules were already approved.

