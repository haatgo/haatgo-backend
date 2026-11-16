# TAD 04 — Operations / Admin Website

**Project:** HaatGo · **Version:** 1.0 draft · **Date:** 14 November 2026  
**Required stack:** **React + TypeScript + Vite + shadcn/ui + Tailwind CSS + Redux (Redux Toolkit) + Redux Persist + Redux Saga + Axios**  
**Audience:** Dispatch, catalogue, support, finance and platform administrators  
**References:** [PRD](PRD.md), [Backend TAD](TAD_05_BACKEND.md), [Design system](references/DESIGN_SYSTEM.md)

## 1. Goals and trust boundaries

The admin web application operates the hyperlocal marketplace: product pricing, zones, market availability, delivery partner approvals, live orders, exceptions, receipt reconciliation, refunds and payout status. It is a **separate frontend** and origin from the customer storefront, sharing backend services and design tokens but not customer authentication policy.

Admin UI does **not** become a privileged source of truth. Every write is validated server-side, permissioned, audited and guarded against concurrent edit conflicts.

### 1.1 Explicit technology choices

- React + TypeScript + Vite.
- shadcn/ui + Tailwind CSS for accessible primitives; local components can extend shadcn Button, Dialog, Sheet, DataTable, Form, Tabs, Badge, Popover, DropdownMenu and Toast.
- Redux Toolkit slices/selectors.
- Redux Persist **allowlist only for harmless UI preferences**, such as selected dashboard filter and density.
- Redux Saga for API orchestration, live events, refresh, debounced search, durable actions and exports.
- Axios instance with auth, request IDs, error mapping and no unsafe mutation retries.
- React Router (or equivalent mature route library) with lazy routes.
- Socket.IO client for live order/dispatch updates; periodic fetch reconciliation.
- A vetted map library for dispatch; maps must have a fully usable table fallback.

## 2. Roles and permissions

Recommended roles (the MVP may initially consolidate them, but server RBAC stays explicit):

| Capability | Super admin | Dispatcher | Catalogue | Support | Finance |
|---|---|---|---|---|---|
| View order list/detail | Yes | Yes | Limited | Yes | Limited |
| Assign/reassign rider | Yes | Yes | No | No | No |
| Edit catalogue/prices | Yes | No | Yes | No | No |
| Manage markets/zones | Yes | Yes (limited) | Limited | No | No |
| Approve/suspend partner | Yes | Yes (limited) | No | No | No |
| View customer support data | Yes | Limited | No | Yes | Limited |
| Initiate refund | Yes | No | No | Request only | Yes |
| Approve reconciliation/payout | Yes | No | No | No | Yes |
| View/edit admin roles | Yes | No | No | No | No |
| Export financial/PII data | Restricted | No | No | No | Restricted |

UI hides unauthorized controls **and** backend rejects unauthorized requests. Read permissions should be scoped by zone when necessary.

## 3. Page and information architecture

~~~text
/admin
├── /login
├── /overview
├── /orders
│   ├── /orders/:publicId
│   ├── /orders/:publicId/assign
│   └── /orders/:publicId/exceptions
├── /dispatch/map
├── /products
│   ├── /products/new
│   ├── /products/:id/edit
│   └── /categories
├── /promotions                      # P1
├── /markets
│   ├── /markets/:id
│   └── /delivery-zones
├── /partners
│   ├── /partners/:id
│   └── /partners/verifications
├── /customers
│   ├── /customers/:id
│   └── /support/tickets
├── /finance
│   ├── /payments
│   ├── /refunds
│   ├── /purchase-reconciliation
│   ├── /cod-reconciliation
│   └── /partner-payouts
├── /reports
├── /audit-log
└── /settings
~~~

Some are separate functional routes beyond the ten admin visual concept frames. Promotions and full analytics report builder are P1.

## 4. Visual and layout architecture

- Desktop reference: 1440×900 px; 232 px left nav, sticky top bar, scrollable content.
- Responsive 1024 px: condensed side navigation; tables keep horizontally scrollable data region with fixed row actions.
- Tablet: drawer navigation, metric cards wrap. Read-only urgent monitoring on mobile; no need to deliver full mobile admin UX.
- Use HaatGo design tokens consistently: ivory canvas, white data panels, deep green sidebar, saffron attention, dark ink text.
- Avoid reliance on colored pills alone; include status labels and icons.
- Admin density target: 12–14 px compact table text with 44 px row actions; no illegible 10 px data.
- Order detail uses a clearly separated timeline, payment, shopping item list, partner, customer and audit panel.
- Dispatch map/mapless list both expose location, rider online/busy status, distance, ETA, offer state, assignment CTA.

## 5. React module structure

~~~text
haatgo-admin-web/                    # independent repository
├── src/
│   ├── app/{App,router,providers,store,authGuard}
│   ├── components/ui/              # shadcn/ui source
│   ├── components/layout/{Sidebar,Topbar,PageHeader}
│   ├── features/
│   │   ├── auth/
│   │   ├── overview/
│   │   ├── orders/
│   │   ├── dispatch/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── markets/
│   │   ├── partners/
│   │   ├── customers/
│   │   ├── support/
│   │   ├── finance/
│   │   ├── reports/
│   │   ├── audit/
│   │   └── settings/
│   ├── shared/{api,permissions,formatters,validators,table,charts,theme}
│   └── styles.css
├── tests/
├── components.json
└── vite.config.ts
~~~

Use route-level boundaries for large charts/map packages; load them only on relevant pages.

## 6. State, persistence and sagas

### 6.1 Redux slices

| Slice | Examples | Persist? |
|---|---|---|
| auth | admin role summary, session state | No credentials |
| overview | metrics, date range, zone filter | Date/zone filter only |
| orders | entities by ID, pagination, selected orderVersion | No |
| dispatch | candidates, offers, selected rider, live events | No |
| catalogue | list/edit draft, category filters | Table preferences only |
| markets | market list, zone details, current editor | No |
| partners | partner list, approval status | No |
| support | tickets and selected thread | No |
| finance | ledger records and refund status | Never |
| ui | dialog state, notices, sidebar collapsed | Collapsed nav only |

Persisting admin finance, customer PII, personal phones, access tokens, partner location or order details in localStorage is **prohibited**. Logging out purges persisted admin preferences as needed.

### 6.2 Saga patterns

- Orders list: takeLatest by filter; cancel stale pagination calls.
- Orders live updates: long-running socket watcher; apply event by orderVersion and refetch on gap.
- Manual assign: takeLeading for a single order, include expectedOrderVersion; handle 409 conflict with refresh.
- Catalogue: save using expectedVersion; show conflict review if another admin modified product.
- Receipt approval: one-shot idempotent mutation with audit reason; no blind retry.
- Refund: gated dialog, permission and amount validation, idempotency key, server status polling; never assume gateway callback success.
- Partner status: subscribe to availability changes; combine with stale heartbeat warning.
- Reports: asynchronous export job then signed download; avoid very large unbounded table queries.
- Session: refresh and role updates; on role revocation redirect and clear data.

## 7. Module designs

### 7.1 Overview dashboard

**Metrics:** orders today, placed, assigned, shopping, delivering, completed, cancelled, average time, gross customer collections, delivery fees, market purchase cost, support backlog.

All cards show time window and currency/units. Do not label platform “revenue” or “profit” without defining inclusion of refunds, promotions, gateway charges, purchase cost and rider payout.

**API:** GET /v1/admin/overview?from=&to=&zoneId=.  
**State:** loading, partial provider error, empty day, data.  
**Refresh:** manual/periodic plus order event invalidation; totals always from server aggregation.

### 7.2 Live orders table

Suggested columns: publicOrderId, placedAt, customer area (not complete address by default), market, item count, customer total, payment status, order status, assignment/rider, exception flag, age, actions.

Filters: status, date, zone/market, payment method, unassigned, exception, partner. Use pagination/cursor; server controls sort.

Row action opens detail; quick assign/cancel requires permission and version guard.

### 7.3 Order detail and timeline

Sections:

- Status timeline with eventAt and actor.
- Items: requested, purchased, unavailable, substituted, selling price, actual purchase cost.
- Quote and final bill: item total, fees, discount, refund, current payable.
- Payment: COD/online authorization, capture/settlement, refund details.
- Fulfillment: market, rider, offer attempts, receipt photo, delivery OTP result (never raw OTP).
- Exceptions/support: reason, comment, owner, resolution.
- Audit: every sensitive state change.

Admin actions require **reason** and confirmation if they affect money or customer delivery.

### 7.4 Dispatch workbench

- Map centered on selected market, list of approved online candidates; false GPS precision not portrayed as exact.
- Candidate shows approximate distance to market, last heartbeat, current assignment state and zone.
- “Assign” sends expected order/partner versions. Confirmation only after backend response.
- If order already assigned between render and click, show conflict and refetch.
- Provide **list-only fallback** when map provider is unavailable or expensive.
- Show offer-expiry timers using server time, not browser time as authority.

### 7.5 Catalogue and pricing

Product fields: active, title, aliases, pack/unit, category, photo(s), sellingPricePaise, minimum/maximum quantity, allowed zone/market, display order, tags, version.

Use Zod (or equivalent) validation for controlled forms, but backend validates independently. Only permitted prices can be changed; every change creates audit with before/after. Archive rather than hard-delete a SKU referenced in old orders.

Bulk import or seasonal pricing is P1; do not silently include in low-cost P0.

### 7.6 Markets and zones

- Market fields: name, geolocation, contact (ops-only), open hours, active/closed flag, supported categories, priority.
- Delivery zone: polygon or fixed-radius coverage, fee rule, market mapping, max radius, closure reason.
- Admin sees preview of serviceability, not direct arbitrary customer location.
- Zone edits must validate geometry and not impact orders already in progress.
- Geofence drag editor is P1; JSON/form coordinates plus preview is enough for MVP.

### 7.7 Partner onboarding and management

- Approval status, verification artifacts, operating zone, last heartbeat, online/busy state, current order and completed deliveries.
- Suspend with reason; if busy, follow escalation policy before unassigning.
- No action should allow a rider who is already busy to accept a second P0 job.
- Payout reconciliation needs separate money records from COD collection and market purchase reimbursement.

### 7.8 Support, refunds and finance

- Support tickets: order/customer link, category, priority, notes, status, handler, closure reason.
- Refunds: show eligible amount from ledger; initiation requires role/approval and idempotency key; gateway callback determines final status.
- Finance reconciliation splits: customer collection, item selling total, actual purchase cost, rider payout, COD owed, refunds, gateway fees.
- CSV export must be role-checked, time-limited and audited. Do not expose full address/phone unless necessary.

## 8. Data table reusable contracts

Every table should support:

- Loading skeleton, empty results, retry/error, server pagination, sorting and filters.
- Pagination state in URL to preserve back/forward; date range default to “Today” Asia/Kolkata.
- Stable primary IDs; never use visible row index as unique React key.
- Shadcn Table/DataTable with accessible column headers; batch operations only where domain supports safe bulk mutation.
- PII columns masked by default; copying/export permissions separately checked.
- Status chips with text, icon/shape, accessible tooltip for exact meaning.

## 9. Authentication, RBAC and security

- Separate admin login origin and token/cookie policy from customers.
- Require strong admin auth; password + MFA is recommended, especially for money operations. If MFA isn't available at MVP, restrict access and document risk.
- Backend enforces claims and zone/resource scope, not just button visibility.
- Avoid placing refresh tokens in Redux Persist/localStorage; prefer secure httpOnly cookie flow.
- CSRF protection if cookie-based; CSP, XSS-safe rendering, rate limiting, HTTPS/HSTS.
- For every mutation: actorId, role, resourceId, before/after or diff, reason, requestId, source IP where lawful/appropriate, occurredAt.
- PII and receipt access via signed or authorized URLs; avoid public buckets.
- Admin impersonation, if ever introduced, requires explicit audit and separate scope; excluded from MVP.

## 10. Concurrency / optimistic locking

**Problem:** Two dispatchers may assign one order, or editor changes can overwrite prices.

**Rule:** Every writable domain object exposes version/updatedAt. Client sends expectedVersion on changes; backend uses atomic conditional update/transaction where appropriate and returns 409 on conflict. UI must reload and offer to re-apply edits. Never retry a failed conflict with an unconditional overwrite.

Examples:

- Assign: orderVersion + candidate riderId + reason → 201 assignment or 409.
- Update SKU: productVersion + changed fields → product newVersion or 409.
- Refund: orderId + amountPaise + refundIdempotencyKey → one pending refund entity.
- Suspend partner: expectedStatus + reason → new status, audit.

## 11. Observability and release

- Dashboard/API errors reported with requestId and redacted context.
- Monitors: admin 401/403 spikes, dispatch conflict rate, stuck orders, refund pending age, provider outages.
- Audit log search by orderId/partnerId/admin actor, with retention rule.
- Frontend release from CI: lint/typecheck/unit/e2e/build → deploy static assets → smoke test → rollback artifact.
- Ensure frontend assets do not include production secrets.
- Staging includes synthetic orders/riders only; do not send customer SMS/push from staging.

## 12. Test matrix

| Area | Test |
|---|---|
| RBAC | Support cannot change SKU or initiate refund; finance cannot override dispatch |
| Dispatch | Stale candidate / double assignment returns conflict |
| Catalogue | Form validation, concurrent edit, archive referenced SKU |
| Markets | Closed zone prevents checkout; in-progress order unaffected |
| Order detail | All stage events and receipt evidence render correctly |
| Finance | Correct separation of COD, reimbursement, payout, refund |
| Tables | Sorting/filter/server paging, empty state, keyboard navigation |
| Realtime | Missed event recovery, socket auth expiry, reconnect refetch |
| Security | Direct URL with wrong role, CSRF, export permissions, PII masking |
| UI | Desktop 1440/1280, tablet 1024, reduced zoom/high contrast |
| E2E | Admin creates product, order appears, dispatches, reviews receipt and settlement |

## 13. Definition of done

- [ ] Uses all explicitly requested web libraries: React, shadcn/ui, Redux, Redux Persist, Redux Saga, Axios.
- [ ] Protected routes plus server-enforced roles are verified.
- [ ] Core order/catalogue/market/partner/support/finance P0 pages present.
- [ ] Manual dispatch has correct assignment conflict handling.
- [ ] Price/zone edits are validated, versioned and audited.
- [ ] Sensitive data not persisted in browser storage.
- [ ] Full order timeline includes market shopping and receipt, not “warehouse packed.”
- [ ] Refund and partner financial flows show distinct ledger states.
- [ ] Automated tests cover role denials and conflicting mutations.

## 14. Dependencies / open questions

- Final admin roles and operational staffing.
- Credentials policy: password/MFA, role/zone grants.
- Actual refund approval limits and reimbursement finance owner.
- Map provider, permitted location visibility and data retention.
- Audit-log retention, reporting/export rules and account deactivation procedure.

**Official references:** [shadcn/ui Vite](https://ui.shadcn.com/docs/installation/vite), [Redux Toolkit](https://redux-toolkit.js.org/usage/usage-guide/), [Redux Saga](https://redux-saga.js.org/docs/introduction/GettingStarted/), [Axios](https://axios-http.com/docs/intro), [MongoDB atomicity](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/).

