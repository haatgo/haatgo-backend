# HaatGo — PRD + Technical Architecture Documentation

**Documentation pack:** v1.0 draft · **Prepared:** 14 November 2026 (IST)  
**Product:** Local-market shopping and hyperlocal delivery in India  
**Business model:** One partner purchases from an existing nearby market and delivers to the customer; no initial dark store/warehouse.

## 1. Document index

| Order | File | Purpose |
|---|---|---|
| 01 | [PRD.md](PRD.md) | Product requirements, scope, roles, stories, UAT, risks, approvals |
| 02 | [TAD_01_CUSTOMER_ANDROID.md](TAD_01_CUSTOMER_ANDROID.md) | Bare RN customer app, Paper UI, navigation, Redux Saga, checkout/tracking |
| 03 | [TAD_02_DELIVERY_ANDROID.md](TAD_02_DELIVERY_ANDROID.md) | Bare RN delivery partner app, offers, market shopping, receipt, OTP |
| 04 | [TAD_03_CUSTOMER_WEB.md](TAD_03_CUSTOMER_WEB.md) | Mobile-first customer React website and browser checkout |
| 05 | [TAD_04_ADMIN_WEB.md](TAD_04_ADMIN_WEB.md) | Operations React admin, roles, order workbench, dispatch, finance |
| 06 | [TAD_05_BACKEND.md](TAD_05_BACKEND.md) | Express TypeScript API, MongoDB, Redis, BullMQ, payment/dispatch contracts |
| 07 | [TRACEABILITY_MATRIX.md](TRACEABILITY_MATRIX.md) | Requirement-to-app/module/API/test cross-reference |
| 08 | [DECISION_LOG.md](DECISION_LOG.md) | Confirmed stack, proposed operational assumptions, open choices |
| 09 | [references/DESIGN_SYSTEM.md](references/DESIGN_SYSTEM.md) | Shared UI tokens, components, screen references and a11y |
| 10 | [references/design-tokens.json](references/design-tokens.json) | Existing HaatGo token values |
| 11 | [references/variables.css](references/variables.css) | Existing CSS design tokens |

## 2. Locked technology stack

| Surface | Technology |
|---|---|
| Customer Android | **Bare React Native Community CLI + TypeScript + React Native Paper (MD3) + Redux/Redux Toolkit + Redux Persist + Redux Saga + Axios** |
| Delivery partner Android | **Bare React Native Community CLI + TypeScript + React Native Paper (MD3) + Redux/Redux Toolkit + Redux Persist + Redux Saga + Axios** |
| Customer web | **React + TypeScript + Vite + shadcn/ui + Tailwind CSS + Redux/Redux Toolkit + Redux Persist + Redux Saga + Axios** |
| Admin web | **React + TypeScript + Vite + shadcn/ui + Tailwind CSS + Redux/Redux Toolkit + Redux Persist + Redux Saga + Axios** |
| Backend API | **Express.js + TypeScript + MongoDB + Redis** |
| Background services | **TypeScript + BullMQ workers backed by Redis; MongoDB outbox and source-of-truth** |
| Realtime | Socket.IO, Redis pub/sub/emitter where appropriate, GET state on reconnect |
| Native Android | Platform Gradle/Kotlin/Java glue only where Android requires it; all application/business code TypeScript |
| Infrastructure | HTTPS/Nginx, VPS pilot, MongoDB replica-set for critical transactions, private Redis, off-host backups |

### Explicit exclusions

- **No Expo.** No Expo managed workflow, Expo Go or EAS dependencies in either mobile project.
- shadcn/ui is only for React **web**. React Native Paper is only for **mobile**.
- No mandatory microservices/Kubernetes/Kafka; this is a modular monolith.
- Redis **does not replace MongoDB** for accepted order, payment, quote, assignment or accounting facts.
- No iOS release, marketplace merchant app or multi-market split order in initial P0 scope unless separately approved.

## 3. Cross-platform implementation principle

~~~mermaid
flowchart TD
    C["Customer RN + Paper"] --> API["Express TypeScript API"]
    P["Partner RN + Paper"] --> API
    W["Customer React + shadcn"] --> API
    A["Admin React + shadcn"] --> API
    API --> DB["MongoDB: domain truth"]
    API --> REDIS["Redis: cache / limits / BullMQ"]
    JOB["TypeScript workers"] --> REDIS
    JOB --> DB
~~~

Updated 15 November 2026: five independent repositories own their source, components,
utilities, theme adapters, dependencies, lockfiles, authentication and releases.
The customer Android and web experiences follow the same **API/DTO behavior** through
owned contract snapshots. No shared web library, domain utility package, node_modules
or sibling import is permitted. The local coordinator copies only contracts, design
tokens and reference documents, and detects drift. See the workspace's
`04_Execution/REPOSITORY_ARCHITECTURE.md` and per-repo execution lists.

## 4. Core product scope

- Customer: OTP, manual location, catalogue, search, product, cart, address, quote, COD/approved online checkout, history, tracking, substitution decision and support.
- Partner: approval, online/offline, rider offer, market route, shopping checklist, substitution/receipt, navigation, delivery OTP and earnings.
- Customer website: responsive parity with customer Android for ordering/status.
- Admin website: catalogue, markets/zones, orders, manual dispatch, partner approval, support, reconciliation, audit.
- Backend: server quote, state machines, geo dispatch, Mongo concurrency, Redis cache/rate limit/BullMQ, events/FCM, COD/gateway and ledger.

## 5. Interpretation of design imagery

The previous HaatGo UI kit contains five PNG boards with **44 conceptual frames**. They are not layered design files, and some frames combine several production routes. The design-system reference is included here for convenience; the original PNG boards remain in the prior design-kit ZIP.

Any illustration, price, personal name, rider earning, map pin, ETA or promotion in the image is a mock value. **PRD and TAD business rules override concept-image text** where they differ. Brand HaatGo remains unapproved placeholder.

## 6. Scope / commercial context

The earlier client quotation was **₹85,000 including one year of server/domain and three months of support**. That commercial figure is context, not an architecture guarantee. Four frontends + TypeScript Express/Mongo/Redis backend are substantial; only signed-off P0 requirements should be committed at this price. External SMS, gateway, mapping, cloud storage, Android publishing and transaction charges need explicit budgeting.

Initial expected volume discussed previously: approximately **1,000 orders/month**. Capacity and SLA goals in PRD are proposed test targets, not actual production measurements.

## 7. Suggested reading order

1. Read PRD, especially **Operating assumptions**, **P0 vs P1** and **open decisions**.
2. Confirm operational rules in DECISION_LOG before implementing payments/dispatch.
3. Read backend TAD for authoritative order/payment/API definitions.
4. Read the relevant platform TAD for route, state, event and test mapping.
5. Build UI against design-system tokens, and reconcile all 44 concepts into actual route inventory.
6. Use TRACEABILITY_MATRIX to verify requirement coverage in code and QA.

## 8. Pre-development sign-off checklist

- [ ] Brand name/domain/trademark permission
- [ ] Fixed selling price model or approved alternative
- [ ] One partner / one market per order policy
- [ ] Rider cash float/purchase-funding and reimbursement policy
- [ ] COD collection/remittance responsibility and online payment scope
- [ ] Cancel/refund and substitution fallback policies
- [ ] Pilot markets, zones, hours, delivery fees, conservative ETA
- [ ] OTP/map/gateway vendor accounts and budget
- [ ] Partner verification and support team responsibilities
- [ ] P0 functionality, milestone dates, change-control process

## 9. Source references

The documents include links to the relevant **official** project documentation: React Native (bare CLI), React Native Paper, shadcn/ui Vite, Redux Toolkit, Redux-Saga, MongoDB geospatial/atomicity, Redis cache/rate limiting, BullMQ, FCM, Socket.IO, Axios. Dependencies should be pinned to compatible supported versions when bootstrapping the actual repo; this kit is not a lockfile.

