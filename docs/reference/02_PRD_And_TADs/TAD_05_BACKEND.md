# TAD 05 — Shared Backend / API / Data / Infrastructure

**Project:** HaatGo · **Version:** 1.0 draft · **Date:** 14 November 2026  
**Consumers:** Customer Android, partner Android, customer React web, admin React web  
**Required stack:** **Express.js + TypeScript + MongoDB + Redis** (Node.js LTS runtime); BullMQ on Redis; Socket.IO; FCM; gateway/OTP/maps adapters; Nginx on VPS  
**Stack status:** Express.js, MongoDB, Redis and TypeScript throughout application code and services were **explicitly specified by the user**. All API, service, worker and shared-domain modules must be written in TypeScript.

## 1. Architecture objectives

Deliver one cost-controlled backend for a local-market **shop-and-deliver** MVP at approximately 1,000 orders/month. It must correctly handle pricing, customer ownership, dispatch concurrency, substitutions, money states and auditable order transitions.

**Architecture choice:** modular monolith with feature boundaries, one Express API process plus TypeScript BullMQ worker process(es); **MongoDB is persistent source of truth and Redis is mandatory** for cache, rate-limit counters, queue scheduling and internal realtime coordination. Avoid speculative microservices, Kafka and Kubernetes.

### 1.1 Context

~~~mermaid
flowchart TD
    C["Customer Android"] --> API["HTTPS Express API"]
    CW["Customer React Web"] --> API
    P["Partner Android"] --> API
    A["Admin React Web"] --> API
    API --> M["MongoDB + audit/outbox"]
    API --> R["Redis cache / limits / BullMQ"]
    API --> WS["Socket.IO"]
    API --> Ext["OTP / FCM / payments / maps"]
    W["Background worker"] --> M
    W --> R
    W --> Ext
~~~

Public web assets are separately served behind HTTPS. All clients authenticate and authorize against the same server-side account/role model.

### 1.2 Bounded domains

| Domain | Owns | Invariants |
|---|---|---|
| Identity | OTP, sessions, roles, devices | Users cannot access another tenant/role's data |
| Geo/Market | zones, markets, hours, serviceability | Closed/unserviceable zone cannot receive new order |
| Catalogue | products/categories/prices | Price/units historical snapshot at checkout |
| Cart/Quote | draft lines, quote totals, expiry | Server is monetary source of truth |
| Orders | order state, line snapshot, order events | Legal transitions, owner scope, idempotent create |
| Dispatch | partner availability, offers, assignments | One active order per partner and one assigned partner per order |
| Shopping | bought/missing items, substitutions, receipt | Unapproved substitute never marked bought |
| Payments | COD, gateway, refunds | No double capture/refund; signed callbacks |
| Finance | purchase cost, payout, reimbursement, reconciliation | Distinct ledger dimensions and audit |
| Notifications | socket event, FCM push | Event version and retry-safe delivery |
| Redis Infrastructure | cache, queue, OTP cooldown, presence, internal pub/sub | Redis outage cannot corrupt MongoDB orders/payments |
| Support/Admin | incidents, manual actions, roles, audit | Sensitive admin actions are attributable |

## 2. Independent repositories and backend module structure

**Updated 15 November 2026:** the user's independent-repository requirement replaces
the earlier monorepo proposal. The five folders in `03_Projects` each own their git
history, dependencies, lockfile, source, tests and release. No shared runtime package,
node_modules, sibling imports, links or workspaces. See
`04_Execution/REPOSITORY_ARCHITECTURE.md` in the documentation workspace (copied into
each repo as `docs/REPOSITORY_ARCHITECTURE.md`).

~~~text
03_Projects/
├── haatgo-customer-android/       # independent bare RN customer repo
├── haatgo-driver-android/         # independent bare RN partner repo
├── haatgo-customer-web/           # independent React customer repo
├── haatgo-admin-web/              # independent React admin repo
└── haatgo-backend/                # independent backend repo
        ├── contracts/            # authoritative versioned contract definitions
│       ├── src/
│       │   ├── server.ts
│       │   ├── app.ts
│       │   ├── config/
│       │   ├── infrastructure/{mongo,redis,bullmq,logging,storage,socket,providers}
│       │   ├── common/{auth,middleware,errors,validation,events}
│       │   └── modules/
│       │       ├── identity/
│       │       ├── geo/
│       │       ├── markets/
│       │       ├── catalog/
│       │       ├── carts/
│       │       ├── checkout/
│       │       ├── orders/
│       │       ├── dispatch/
│       │       ├── shopping/
│       │       ├── payments/
│       │       ├── finance/
│       │       ├── notifications/
│       │       ├── support/
│       │       └── admin/
│       ├── worker/{index,offerExpiry,sendPush,reconcilePayments,cacheInvalidation}
│       ├── tests/{unit,integration,contract,e2e}
│       ├── docs/
│       └── package.json           # created during backend bootstrap
~~~

Each module exposes controller/route, DTO/validator, service/use cases, repository and event types. Controllers are thin. Services may call other module interfaces, not reach into each other's collections arbitrarily.

The API and worker share modules only within the backend repository. Clients own
local contract/token snapshots and generated declarations, never backend logic.
The surrounding local coordinator propagates approved artifacts and detects drift;
consumer implementation, provider/consumer tests and runtime refresh/recovery remain
explicit tasks in each repo's execution list.

## 3. Technical building blocks and rationale

| Building block | Proposed implementation | Notes |
|---|---|---|
| HTTP | Express + TS + Zod or Joi | Typed request/response validation |
| Database | MongoDB with 2dsphere indexes | Geo rider/market queries and flexible SKU snapshots |
| Redis | Redis with authenticated private connection, TTLs and metrics | Mandatory backend dependency; non-authoritative data and queue |
| Transactions | Replica-set MongoDB transactions for cross-document critical flows | Even a single-node replica set for MVP if using transactions |
| Job runner | **BullMQ on Redis**, TypeScript workers | Deterministic job IDs, backoff, retries, Mongo outbox recovery |
| Cache | Redis cache-aside catalogue/zone/product reads | TTL/invalidation; bypass cache if Redis down |
| Rate limiting | Redis counters/token bucket | OTP/send, delivery OTP, login, checkout and API abuse |
| Realtime | Socket.IO with Redis pub/sub/emitter where useful | Reconnect must GET Mongo authoritative state |
| Push | FCM | Device token registration and deduplicated job queue |
| OTP | External SMS OTP provider adapter | Rate limiting, hashing, TTL |
| Payment | Gateway adapter (e.g. Razorpay), COD ledger | Webhook signatures and idempotency |
| Images | Private object storage / restricted upload service | Products and receipt proof have different ACLs |
| Maps | Routing/distance provider adapter | Geospatial prefilter then route ETA only if budget permits |
| Logging | Structured JSON logs with request IDs | PII redaction |
| Ops | VPS, Nginx, TLS, process manager and backup | Cloud managed services optional, not assumed |

Official context: [MongoDB geospatial queries](https://www.mongodb.com/docs/manual/geospatial-queries/), [MongoDB atomicity and transactions](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/), [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/), [Redis rate limiter](https://redis.io/docs/latest/develop/use-cases/rate-limiter/), [BullMQ](https://docs.bullmq.io/guide/introduction), [Socket.IO delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/).

### 3.1 Redis architecture and ownership

Redis is mandatory for infrastructure needs. **MongoDB owns permanent state**: users, catalogue truth, price quotes, orders, assignments, payment facts, order event history, outbox and ledger. Redis keys **must never be the only copy** of an accepted order, payment, rider assignment or refund.

| Use | Example Redis key/pattern | TTL/persistence | Source of truth |
|---|---|---|---|
| Catalogue cache | haatgo:prod:cache:catalog:{zoneId}:{queryHash} | ~30–120 s/configurable, invalidate on publish | Mongo products/markets |
| Service zone cache | haatgo:prod:cache:zone:{zoneId} | ~1–5 min, invalidate on zone edit | Mongo zones |
| OTP cooldown | haatgo:prod:otp:cooldown:{phoneHash} | 30–120 s by provider policy | OTP challenge in Mongo |
| OTP/IP rate limiter | haatgo:prod:rate:{scope}:{hashedKey} | Sliding/fixed window as policy | Redis guard plus service policy |
| Partner presence | haatgo:prod:presence:partner:{id} | Short heartbeat TTL | Mongo approval/assignment and heartbeat |
| Session revocation cache | haatgo:prod:session:revoked:{jti} | Remaining token TTL | Mongo session status |
| BullMQ jobs | BullMQ-managed namespaced queue keys | Until completed/retained per queue policy | Mongo outbox/domain records |
| Realtime pub/sub | Socket.IO Redis adapter channels | Ephemeral, no replay guarantee | Mongo order event sequence |

Use explicit environment prefixes and never put raw phone numbers, full addresses or token secrets into Redis keys. Track hit ratio, memory, queue depth, oldest pending job, Redis connectivity and evictions.

### 3.2 Cache-aside flow

1. GET catalogue/zone checks valid namespaced cache.
2. On miss, query indexed MongoDB, serialize safe public response, store with TTL.
3. Product, price, category, market or zone edit writes MongoDB first and emits durable invalidation event through outbox/BullMQ.
4. Cache invalidation removes affected keys; short TTL bounds stale exposure.
5. Checkout **always revalidates prices and serviceability against MongoDB** inside the authoritative quote/order operation, irrespective of cached browse response.

No shared Redis result may accidentally include a customer address, private pricing/payout data or admin-only payload.

### 3.3 BullMQ queue design

| Queue | Jobs | Retry/uniqueness |
|---|---|---|
| dispatch | offer next rider, expire/retry offer, no-partner escalation | jobId derived from orderId+attempt/version |
| notifications | FCM push, status notification | eventId as jobId; token failure cleanup |
| payments | reconcile pending payment/refund/webhook side effect | gateway reference + action |
| shopping | approval timeout, receipt verification workflow | substitutionRequestId + version |
| finance | settlement/reimbursement review | orderId + settlement version |
| maintenance | stale presence, staging upload cleanup, monitoring | scheduled; harmless reruns |

**Delivery guarantee:** BullMQ jobs may run more than once after retries/stalls. Every processor must be idempotent and check current MongoDB state before side effects. Set bounded attempts, exponential backoff, retention, dead-letter/failed-job review, and alert on oldest waiting job. Use supported BullMQ job schedulers instead of obsolete repeatable-job APIs.

### 3.4 Durable outbox bridge (MongoDB ↔ Redis)

- Commit business entity mutation and outbox event in one MongoDB transaction.
- A TypeScript outbox publisher polls unprocessed outbox records, enqueues corresponding BullMQ job with deterministic jobId, and marks publication after successful enqueue.
- On Redis/network outage, outbox rows remain pending in Mongo; publisher resumes when Redis returns. Duplicate enqueue is harmless.
- Worker reads current Mongo state and uses per-operation idempotency keys; queue ACK does not substitute for completed business transaction.
- Socket.IO/FCM notifications happen downstream of committed order state, so users never see a “delivered” push for a rolled-back transition.

### 3.5 Redis failure policy, durability and security

- **Catalogue cache down:** query MongoDB directly with bounded rate/timeout; keep shopping readable.
- **Queue down:** write accepted business transition + Mongo outbox; show pending fulfillment if future job cannot dispatch yet; alert operations.
- **OTP/rate limiter down:** fail closed or use strictly bounded alternate Mongo-backed throttle; never drop security throttling entirely.
- **Presence key expired:** treat candidate as unavailable until fresh authorized heartbeat confirms.
- **Redis data loss:** rebuild caches/presence; replay unprocessed Mongo outbox events and reconcile all nonterminal orders/payments.
- Redis bound to loopback/private network, require auth/ACL, restrict client commands, use TLS when off-host; **never expose port 6379 publicly**.
- Reserve memory for queues and use a policy avoiding eviction of critical BullMQ keys (e.g., noeviction with alerts; separate Redis cache/queue instances if growth demands). Cache entries need bounded TTL; monitor memory usage.
- Consider AOF persistence for Redis queue resilience, but MongoDB business records/outbox remain the recovery foundation. Backup/restore test both systems with explicit RPO/RTO.

## 4. API conventions

### 4.1 General conventions

- Prefix: **/v1**; HTTPS only.
- Authentication: Bearer access token for Android; web may use short-lived access in memory plus secure refresh cookie under explicit CSRF/CORS policy.
- Resource ownership: user/customer/partner scope checked server-side even if request ID is syntactically valid.
- Request IDs: X-Request-Id (generate if missing); return same ID in error responses.
- Idempotency-Key required for order creation, refund initiation, receipt finalization and other high-risk mutations.
- Timestamps: ISO 8601 UTC from API; clients display Asia/Kolkata.
- Money: integer minor units with field suffix **Paise**; no floating-point INR in persistence.
- Units: product Unit enum (G, KG, ML, L, PIECE, BUNCH) and explicit pack quantity.
- Pagination: consistent cursor/limit or page/size per resource, explicit total only when economical.
- Versioned optimistic writes: expectedVersion field or If-Match header; return 409 on stale version.
- No silent partial mutation success: return precise line/field error or explicit partial result status.

### 4.2 Success response

~~~json
{
  "data": {"publicOrderId": "HG-20261114-0001", "status": "placed"},
  "meta": {"requestId": "req_abc", "serverTime": "2026-11-14T12:30:00Z"}
}
~~~

### 4.3 Error response

~~~json
{
  "error": {
    "code": "ORDER_VERSION_CONFLICT",
    "message": "This order changed. Refresh before continuing.",
    "details": {"currentVersion": 8},
    "retryable": false
  },
  "meta": {"requestId": "req_abc"}
}
~~~

Use HTTP semantics: 400 invalid request, 401 unauthenticated, 403 unauthorized, 404 not visible/not found, 409 stale/conflict, 422 policy/validation rejection, 429 throttled, 5xx infrastructure faults.

## 5. Endpoints by bounded domain

The following is an **API design catalogue**, not machine-generated OpenAPI. Freeze request/response schemas in a checked-in OpenAPI file during implementation.

### 5.1 Identity / sessions

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | /v1/auth/otp/send | Public/rate-limited | Send login challenge |
| POST | /v1/auth/otp/verify | Public/rate-limited | Verify challenge, return session |
| POST | /v1/auth/token/refresh | Session | Rotate refresh token |
| POST | /v1/auth/logout | Session | Revoke/clear tokens |
| GET | /v1/me | Customer/partner | Current user/partner |
| POST | /v1/devices | Auth | Register/rotate FCM token |
| DELETE | /v1/devices/:deviceId | Auth | Revoke push target |
| POST | /v1/admin/auth/login | Admin | Admin identity login |
| POST | /v1/admin/auth/logout | Admin | Revoke admin session |

### 5.2 Location / catalogue / cart / checkout

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | /v1/geo/serviceability?lat=&lng= or pincode= | Public | Zone/market eligibility |
| GET | /v1/catalog/home?zoneId= | Public | Home categories/shelves |
| GET | /v1/categories | Public | Active category list |
| GET | /v1/products?zoneId=&categoryId=&cursor= | Public | Products with server price |
| GET | /v1/products/search?q=&zoneId= | Public | Product search |
| GET | /v1/products/:id | Public | Product detail |
| GET | /v1/addresses | Customer | Saved addresses |
| POST | /v1/addresses | Customer | Add address |
| PATCH | /v1/addresses/:id | Customer owner | Edit address |
| DELETE | /v1/addresses/:id | Customer owner | Soft-delete address |
| GET | /v1/cart | Customer | Current cart |
| PUT | /v1/cart | Customer | Replace/sync draft with expected revision |
| POST | /v1/checkout/quote | Customer | Validated price/zone/fee snapshot |

### 5.3 Customer orders and payments

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | /v1/orders | Customer | Create from valid quote; idempotent |
| GET | /v1/orders?cursor= | Customer | Own order list |
| GET | /v1/orders/:publicOrderId | Customer owner | Current order detail and event version |
| POST | /v1/orders/:id/cancel | Customer owner | Policy-driven cancellation |
| GET | /v1/orders/:id/substitutions | Customer owner | Pending/decided substitutions |
| POST | /v1/orders/:id/substitutions/:requestId/decision | Customer owner | Approve/reject with order version |
| POST | /v1/payments/gateway-order | Customer owner | Create payment intent for eligible order |
| GET | /v1/payments/:paymentId/status | Customer owner | Authoritative payment state |
| POST | /v1/payments/verify-callback | Customer owner | Verify payment return safely |
| POST | /v1/webhooks/payment | Gateway signed | Raw-body signed event, dedup |
| GET | /v1/support/tickets | Customer owner | Own tickets |
| POST | /v1/support/tickets | Customer owner | Support issue |

### 5.4 Partner / shopping / delivery

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | /v1/partner/me | Approved/registered partner | Approval and capability |
| PUT | /v1/partner/availability | Approved partner | Request online/offline |
| POST | /v1/partner/heartbeat | Available/active partner | Current location and health |
| GET | /v1/partner/offers/current | Partner | Current live offer |
| POST | /v1/partner/offers/:id/accept | Partner | Atomic valid acceptance |
| POST | /v1/partner/offers/:id/decline | Partner | Decline one offer |
| GET | /v1/partner/assignments/active | Partner | Current task snapshot |
| POST | /v1/partner/orders/:id/arrive-market | Assigned partner | Record arrival |
| PATCH | /v1/partner/orders/:id/shopping-items/:lineId | Assigned partner | Bought/missing draft |
| POST | /v1/partner/orders/:id/substitutions | Assigned partner | Propose substitute |
| POST | /v1/partner/orders/:id/receipt/upload-intent | Assigned partner | Get signed upload |
| POST | /v1/partner/orders/:id/receipt/confirm | Assigned partner | Attach proof and actual cost |
| POST | /v1/partner/orders/:id/shopping/complete | Assigned partner | Finalize shopping step |
| POST | /v1/partner/orders/:id/out-for-delivery | Assigned partner | Begin delivery |
| POST | /v1/partner/orders/:id/delivery/verify | Assigned partner | Server OTP verification |
| POST | /v1/partner/orders/:id/incident | Assigned partner | Exception/unreachable |
| GET | /v1/partner/earnings | Partner | Payout and reimbursement view |

### 5.5 Admin / finance

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | /v1/admin/overview | Permitted admin | KPI summary |
| GET | /v1/admin/orders | Ops/support | Filter/paginate orders |
| GET | /v1/admin/orders/:id | Permitted admin | Details/events/receipt |
| POST | /v1/admin/orders/:id/assign | Dispatcher | Manual partner assignment |
| POST | /v1/admin/orders/:id/reassign | Dispatcher | Override with reason/version |
| POST | /v1/admin/orders/:id/resolve-exception | Ops/support | Exception resolution |
| GET/POST | /v1/admin/products | Catalogue | List/create |
| PATCH | /v1/admin/products/:id | Catalogue | Versioned edit/archive |
| GET/POST | /v1/admin/categories | Catalogue | List/create |
| GET/POST | /v1/admin/markets | Ops | List/create |
| PATCH | /v1/admin/markets/:id | Ops | Update market status |
| GET/POST | /v1/admin/zones | Ops | Service zones and fee rules |
| GET | /v1/admin/partners | Ops | Partner roster |
| POST | /v1/admin/partners/:id/approve | Ops | Approve |
| POST | /v1/admin/partners/:id/suspend | Ops | Suspend with reason |
| GET | /v1/admin/support/tickets | Support | Ticket queue |
| PATCH | /v1/admin/support/tickets/:id | Support | Update ticket |
| GET | /v1/admin/finance/payments | Finance | Payment collection ledger |
| GET | /v1/admin/finance/reconciliation | Finance | Purchase/COD/payout entries |
| POST | /v1/admin/finance/refunds | Finance | Initiate idempotent refund |
| GET | /v1/admin/audit | Super-admin | Sensitive change log |
| GET | /v1/admin/reports/orders | Permitted admin | Paginated/export job |

**Security note:** A literal GET/POST table row lists method variants as a shortcut; OpenAPI must declare each operation separately.

## 6. Data model / MongoDB collection design

All collection structures below are illustrative. Add createdAt, updatedAt, version, createdBy/updatedBy where relevant; index by access patterns and apply migrations.

| Collection | Key fields | Required indexes / consistency |
|---|---|---|
| users | _id, phoneHash/normalizedPhone, name, status | Unique normalizedPhone |
| otp_challenges | phoneKey, otpHash, attempts, expiresAt, providerRef | TTL expiresAt; rate limits |
| sessions | userId, role, refreshTokenHash, deviceId, expiresAt, revoked | TTL expiresAt, userId |
| devices | actorId, platform, fcmTokenHash/ref, lastSeen | Unique provider token |
| addresses | userId, label, fields, geo Point, deletedAt | userId, optional geo |
| markets | name, location Point, hours, active, categories | location 2dsphere; active |
| zones | name, polygon/radius, marketPriority, fees, hours, active | geospatial if polygon |
| categories | slug, name, order, active | unique slug |
| products | sku, slug, categoryId, unit, packSize, sellingPricePaise, active, market/zone flags | unique SKU; category/active; search index |
| carts | userId, lines, revision, updatedAt | Unique userId |
| quotes | userId, addressId, zoneId, marketId, lineSnapshots, totalPaise, expiresAt, cartRevision | quoteId; TTL after retention decision |
| orders | publicId, customerId, marketId, addressSnapshot, lines[], quoteSnapshot, paymentState, stage, version, assignedPartnerId | Unique publicId; customerId+date; stage+date |
| assignments | orderId, partnerId, offerId, acceptedAt, status | Unique active order and active partner constraints |
| offers | orderId, partnerId, expiresAt, status, attempt | orderId+attempt; partnerId+status |
| partner_profiles | userId, approvalStatus, availability, location Point, lastHeartbeatAt, activeOrderId | userId unique; location 2dsphere; status+heartbeat |
| substitutions | orderId, lineId, candidate SKU, proposedPricePaise, status, deadline, decidedAt, version | orderId+status |
| purchase_receipts | orderId, partnerId, uploadKey, actualLines, totalPurchaseCostPaise, verificationStatus | orderId unique when P0 one receipt/order |
| payments | orderId, provider, providerOrderId, amountPaise, status, eventRefs | Unique providerOrderId where present |
| refunds | orderId, paymentId, amountPaise, status, gatewayRefundId, idempotencyKey | Unique idempotencyKey/gatewayRef |
| ledger_entries | account, orderId, actorId, entryGroupId, debitPaise, creditPaise, purpose | entryGroupId; orderId+time |
| partner_payouts | partnerId, orderId, earningPaise, reimbursementPaise, status | partnerId+date; orderId |
| cod_collections | orderId, partnerId, expectedPaise, collectedPaise, remittedPaise, status | Unique orderId |
| support_tickets | orderId, userId, issue, status, priority, agentId | status+createdAt |
| order_events | orderId, seq, from, to, actor, at, metadata | Unique orderId+seq |
| outbox_events | eventId, aggregateId, type, payload, publishedAt, attempts | Unique eventId; pending index |
| audit_logs | actorId, role, action, resourceId, before/after diff, reason, requestId | resourceId+date, actorId+date |
| idempotency_keys | actorId, route, key, requestHash, responseRef, state, expiresAt | Unique actor+route+key |
| provider_webhooks | provider, providerEventId, signatureValid, processedAt, status | Unique provider+providerEventId |

### 6.1 GeoJSON format

~~~json
{
  "type": "Point",
  "coordinates": [88.3700, 22.5200]
}
~~~

**Coordinate ordering is [longitude, latitude]**, not [latitude, longitude]. Create 2dsphere indexes on partner and market positions; filter partner status/approval/heartbeat before distance rank. For polygon-based service zones, store legal GeoJSON polygons with correct ring closure and validate geometry.

### 6.2 Order document example

~~~json
{
  "publicOrderId": "HG-20261114-0001",
  "customerId": "usr_123",
  "marketId": "mkt_1",
  "zoneId": "zone_1",
  "status": "shopping",
  "version": 7,
  "addressSnapshot": {
    "pincode": "700150",
    "locality": "Sonarpur",
    "geo": {"type": "Point", "coordinates": [88.4, 22.45]}
  },
  "lines": [
    {
      "lineId": "line_1",
      "productId": "prd_tomato",
      "name": "Tomato (Desi)",
      "packUnit": "500 g",
      "quantity": 2,
      "unitSellingPricePaise": 2800,
      "lineSellingTotalPaise": 5600,
      "fulfillmentState": "requested"
    }
  ],
  "pricing": {
    "itemsPaise": 5600,
    "deliveryFeePaise": 2900,
    "discountPaise": 0,
    "totalPaise": 8500,
    "currency": "INR"
  },
  "payment": {"method": "COD", "status": "unpaid"},
  "assignedPartnerId": "ptr_123",
  "lastEventSequence": 12
}
~~~

Do not store sensitive direct-contact details in public socket event payloads. Historical product/price/address snapshots must remain stable even if catalogue is edited.

## 7. Order state machine

~~~mermaid
stateDiagram-v2
    [*] --> placed
    placed --> assignment_pending
    assignment_pending --> partner_assigned
    partner_assigned --> partner_accepted
    partner_accepted --> traveling_to_market
    traveling_to_market --> shopping
    shopping --> shopping_review
    shopping_review --> shopping
    shopping --> purchased
    purchased --> out_for_delivery
    out_for_delivery --> delivered
    placed --> cancelled
    assignment_pending --> cancelled
    shopping --> exception
    exception --> shopping
    exception --> cancelled
~~~

Payment has its **own state machine**, not a single boolean within order:

- Payment states: initiated → pending → verified/paid, failed, expired; verified → refund_pending → partially_refunded/refunded (depending on amount).
- COD states: to_collect → collected → remittance_pending → remitted/disputed.
- Partner settlement: estimated → earned → approved → paid/disputed.

Every transition must declare allowed source states, actor roles, side effects, audit event, idempotency behavior and compensation. Implement a typed transition table rather than scattered “if” conditions in controllers.

### 7.1 Example transition constraint

“shopping → purchased” requires:
1. Assigned partner is current and approved.
2. Every requested line marked bought, approved substituted or removed per rule.
3. No unresolved customer approval.
4. Actual quantities and costs validated.
5. Receipt requirement satisfied.
6. Order version matches.
7. Transaction writes purchase snapshot, status, order event and outbox event.

### 7.2 Terminal orders

Delivered and cancelled are terminal for **fulfillment**, but refund, COD remittance, finance settlement and support may continue independently. Never reopen a delivered order by changing a string; use explicit correction event with audit.

## 8. Dispatch engine and concurrency safety

### 8.1 Candidate selection

1. Confirm order status is dispatchable and chosen market open.
2. Query approved partners with availability=available, fresh heartbeat, no active order.
3. Geo prefilter by nearest to **market** (not customer); initial radius **2 km illustrative/configurable**.
4. Optionally call route ETA provider for top candidates within API budget.
5. Sort by available, ETA/distance, last-offered fairness and configurable rules.
6. Reserve one candidate; issue a single offer with server-generated expiry (e.g., 20 s configurable).
7. If declined/expired, release reservation, try next; expand to 5 km if allowed.
8. If exhausted, mark assignment_pending with nextRetryAt and admin exception.
9. Admin manual override uses the same atomic assignment machinery, not a bypass.

### 8.2 Acceptance transaction

**Do not rely on two independent writes without protection.** With MongoDB replica-set transactions:

- Verify offer pending and server time < expiresAt.
- Verify partner is reserved for that offer and not busy.
- Verify order is still assignment_pending/offer_pending and version unchanged.
- Atomically update offer to accepted, assignment to active, partner busy/activeOrderId and order assignedPartnerId/status/version.
- Append order event/outbox in the same transaction.
- Unique index/partial unique constraint on active assignments prevents partner or order duplication.
- Return 409 when failed, then reload authoritative state.

If MVP uses MongoDB standalone without transactions, **redesign** to use unique claim records and compensating recovery before launch; do not advertise cross-document atomicity you do not have. A single-node replica set can provide transactions but requires disciplined ops and backups.

### 8.3 Crash and timeout recovery

- Worker periodically sweeps expired offers using DB server time.
- Release stuck reservations only after verifying offer state/order assignment in one guarded transaction.
- Lease jobs so restart or two worker instances cannot execute same job twice; job side effects remain idempotent.
- Do not use only in-memory setTimeout for durable offer expiry or payment reconciliation.
- Admin sees reason codes: NO_AVAILABLE_PARTNER, ALL_DECLINED, LOCATION_STALE, MARKET_CLOSED, PROVIDER_ERROR.

### 8.4 Dispatch pseudocode

~~~text
dispatch(orderId):
  assert order dispatchable
  candidates = geoEligiblePartners(order.marketLocation, radiusPolicy)
  for candidate in ranked(candidates):
      if !reserveCandidateAtomically(candidate, orderId): continue
      offer = createOfferAndEvent(orderId, candidate, expiresAt)
      publishOffer(offer)
      return offer
  markNeedsManualDispatch(orderId)
~~~

The production implementation needs transaction boundaries and sweep/resume semantics detailed above; pseudocode omits error compensation.

## 9. Quote engine and customer monetary invariants

- Client sends product IDs/quantities and address/zone.
- Server validates active SKU, allowed zone, unit, quantity, market availability, delivery fee rule, active promotion and address.
- Snapshot: unitPricePaise, linePricePaise, itemsTotalPaise, deliveryFeePaise, discountsPaise, taxPaise (when applicable), totalPaise, quoteExpiresAt and quoteVersion.
- Invariant: **totalPaise = itemsTotalPaise + deliveryFeePaise + handlingFeePaise + taxPaise − discountPaise**; all values integers.
- Quote expiration and cart revision checked during order create.
- Payment amount must equal server-finalized payable amount, not a number from mobile/web.
- After accepted order, market purchase cost is internal. For unavailable line, cheaper substitution or removal updates a governed adjustment/refund record. **Never silently charge more**.
- Idempotency: same actor/route/key + same request hash returns original response; same key with different payload returns 409.
- Quote/currency/price history stored with order, not referenced live from mutable SKU.

## 10. Payment and financial ledger

### 10.1 COD

1. Order marked paymentMethod=COD and amountDuePaise.
2. Partner completes OTP delivery and records amountCollectedPaise.
3. Backend creates COD_COLLECTION ledger event and partner cash liability.
4. Operations reconciles collection vs remittance separately.
5. Over/underpayment yields discrepancy ticket; does not fake full settlement.
6. Refunds for COD are handled by an explicit customer reimbursement process; never mark online gateway refund succeeded when none exists.

### 10.2 Online payment

1. Backend creates gateway payment order/intent for current payable amount.
2. App/web opens gateway UI with public order reference and client-safe key only.
3. Gateway callback is **not** sole proof: backend validates signature/transaction status and consumes **raw-body signed webhook**.
4. Deduplicate provider event ID; enforce separate unique business payment-order constraint.
5. Update payment state with version/transaction and append outbox event.
6. Worker reconciles pending payment after callback loss or temporary provider failure.
7. A confirmed paid order is dispatched only after payment policy permits it.
8. Refund calls use idempotency key and record refund_pending until provider confirms terminal result.

Razorpay documentation highlights signed webhook handling and retries; verify implementation against the provider's current production documentation at integration time: https://razorpay.com/blog/payment-gateway-webhooks-india/

### 10.3 Reconciliation

Maintain distinct financial records:

- Customer item selling revenue.
- Delivery/handling fees.
- Promo discounts and refund amounts.
- Actual local-market purchase cost.
- Partner delivery earnings.
- Partner purchase reimbursement / float.
- COD collected and COD remitted.
- Payment gateway fees, settlement and chargebacks.

Use append-only balanced ledger entries or an equivalent auditable accounting model; don't infer outstanding cash from final order total alone. All changes link to orderId, actor, reason and external transaction references.

## 11. Shopping substitutions and receipt proof

- Partner creates substitution proposal with original line ID, candidate SKU, quantity, proposed customer price and expiry.
- Server checks the candidate catalogue, max price rule and matching active order version.
- Notify customer via push/socket; record response with exact proposal version.
- Until approved, item is not eligible for purchase completion.
- Rejection/timeout triggers removal/exception according to configured policy.
- Receipt upload uses protected object path: partner/order association, allowed mime/size and scan/exif handling.
- Receipt image stores actual purchase cost evidence; no OCR dependency in P0.
- Final shopping submit validates receipt and all line dispositions in a transaction.
- Admin can flag disputed receipt, open support/reconciliation issue, but must not silently rewrite purchase history.

## 12. Realtime architecture

### 12.1 Socket.IO rooms

- customer:{userId}: only authenticated owning customer(s).
- order:{orderId}: only owner + assigned partner + permitted admin.
- partner:{partnerId}: assigned partner event channel.
- admin:orders / admin:zone:{zoneId}: verified permitted operations sessions.

Room subscriptions are authorized server-side; never trust client-supplied room ID blindly. Refresh authorization after token rotation. Do not emit personal addresses to broad admin zone rooms.

### 12.2 Event envelope

~~~json
{
  "eventId": "evt_01",
  "aggregateType": "order",
  "aggregateId": "HG-20261114-0001",
  "seq": 13,
  "type": "order.stage_changed",
  "occurredAt": "2026-11-14T12:30:00Z",
  "payload": {"status": "out_for_delivery", "etaMinutes": 18}
}
~~~

- Persist event/outbox first, publish asynchronously; on success mark outbox delivered.
- Socket.IO has **at-most-once by default**; reconnecting client GETs latest state plus event sequence to recover missed state.
- EventId and sequence prevent duplicate/out-of-order application.
- UI must never interpret push delivery as proof that order action has completed.
- If web/mobile need full history, provide GET /v1/orders/:id/events?afterSeq= on owner-authorized route (P1 unless needed for recovery).

## 13. Background jobs, notifications, and external provider adapters

### 13.1 Jobs

| Job | Trigger | Retry/exception |
|---|---|---|
| offer_expiry_sweep | BullMQ scheduled job / delayed offer expiration | Guarded Mongo status/version check before release |
| assignment_retry | No available rider / dispatch outbox event | BullMQ backoff and admin alert |
| payment_reconcile | Pending gateway state | BullMQ retries provider query; Mongo idempotency |
| push_dispatch | Mongo outbox notification event | BullMQ retry transient errors; discard invalid FCM token |
| cache_invalidate | Catalogue/zone update | Remove Redis keys after Mongo commit; short TTL safety |
| substitution_timeout | Customer decision deadline | Check Mongo version; fallback by explicit policy |
| proof_cleanup | Expired staging uploads | Remove unlinked private objects |
| settlement_review | Delivered order | Generate reconciliation/manual approval |
| backup_verification | Scheduled job | Alert if Mongo off-host backup missing/invalid |

Workers use **BullMQ Redis-backed delayed jobs, retries and schedulers** plus Mongo outbox for recovery; never depend on in-memory timers as the sole mechanism. All TypeScript processors tolerate duplicate delivery and record a terminal failure for admin review.

### 13.2 Provider interface boundaries

~~~text
OtpProvider.send / verifyChallenge
PaymentProvider.createIntent / verifyCallback / refund / fetchStatus
MapProvider.estimateRoute / reverseGeocode
PushProvider.sendToDevice
ObjectStore.createUploadIntent / inspectObject / generateReadUrl
~~~

Keep adapters mockable and configurable. Do not bake SMS/map/gateway vendor-specific types into core order business logic.

## 14. Security architecture

- Every endpoint validates input; authorization is role + ownership + resource scope.
- OTP challenges are hashed, expiring, rate-limited per phone/IP/device; don't reveal if a number exists.
- Access tokens short-lived; refresh rotation/revocation and device registration tracked.
- Admin authentication stronger than customer flow; MFA recommended.
- Use TLS end-to-end, restricted CORS allowed origins, CSRF for cookie auth, secure cookie attributes, CSP for web.
- Secret keys live in server environment/secret management, never Vite or React Native bundles.
- Webhook signature must be verified over raw body with correct secret, constant-time comparison where applicable.
- Prevent mass-assignment by allowing only DTO fields in update operations.
- Private object storage for receipts and identity documents; short-lived authorized read access only.
- Use PII-safe structured logs; no raw OTP, API tokens, card info or full address in common logging.
- Rate limit login, search abuse, repeated checkout, delivery OTP and admin exports.
- Audit sensitive actions with actor, role, resource, diff, reason, timestamp, requestId.
- Establish retention/deletion policy and update privacy/Play declarations before launch.

## 15. Infrastructure / VPS deployment

### 15.1 Initial topology

~~~mermaid
flowchart TD
    HTTPS["Internet HTTPS"] --> NGINX["Nginx TLS + routing"]
    NGINX --> WEB["Static customer/admin builds"]
    NGINX --> API["Node Express API + Socket.IO"]
    API --> DB["MongoDB replica set"]
    API --> REDIS["Private Redis / BullMQ"]
    API --> OBJ["Private object storage"]
    WORKER["TypeScript BullMQ worker"] --> REDIS
    WORKER --> DB
    WORKER --> OBJ
~~~

**Deployment details:**

- Single VPS can host web assets, Express API, BullMQ worker, MongoDB and Redis only if sized/tested for pilot; MongoDB/Redis may be managed or separate depending memory, operations ability and budget. Avoid unsubstantiated hosting/free-tier cost claims.
- If using MongoDB transactions, configure a replica set even if single node; document that a single-node replica set is still a single point of failure.
- Restrict MongoDB and Redis ports to private interfaces; enable Redis ACL/auth, appropriate persistence for jobs, memory alerts, and queue restart/recovery runbook.
- Nginx proxy WebSocket upgrade headers, HTTP timeouts, HTTPS redirect and static caching.
- Use process supervisor (systemd/PM2) or a well-defined container deployment; explicit service restart and logs.
- Separate staging/production config, secrets, Mongo DBs, **Redis namespaces/instances**, BullMQ queues and provider keys.
- Daily encrypted Mongo backup with **off-host copy**, plus verified Redis job/outbox recovery and configured AOF where appropriate.
- Health endpoints GET /health/live and GET /health/ready, with separate Mongo and Redis checks and degraded readiness states.
- Monitoring: CPU/RAM/disk, Redis memory/evictions, BullMQ waiting/failed jobs, error rate, dispatch queue age, order stuck age, payment backlog, backup status.
- CI deploy runs typecheck/lint/tests, DB migration, release, smoke test and rollback plan.
- Never expose DB or internal worker ports publicly. Restrict admin origin/IP where viable.

### 15.2 Capacity assumptions

At ~1,000 monthly orders average ≈33/day, but market-hour bursts can be far larger. Design for at least:
- Pilot QA: ≥10 simultaneous checkout requests, ≥30 socket clients, ≥10 offer attempts under competition.
- Index-supported product browsing and bounded pagination.
- Redis cache-aside for repeated catalogue reads; **BullMQ queued** push/outbox processing; Redis failure should not corrupt accepted orders.
- p95 indexed read target <500 ms under test load excluding third-party network calls.
- No single DB table/collection scan on home or live orders path.

Capacity targets require measurement on chosen VPS; no hard RAM/CPU sizing can be guaranteed before fixtures/load tests.

## 16. Observability, incidents and support

**Structured log fields:** timestamp, level, service, requestId, actorType/ID pseudonym, route, durationMs, statusCode, orderId, errorCode. Mask PII.

**Metrics:** order placement success, provider error rate, active offers, expired offers, pending assignments, stale rider heartbeat, payment pending age, unfulfilled substitutions, receipt uploads, unremitted COD, failing refunds.

**Alerts:** payment verification failure spike, no dispatch for new orders, stuck shopping > configured threshold, backlog worker stopped, disk low, backup failed, high 5xx.

**Runbooks:** no-rider, payment webhook outage, map provider outage, market closure, suspicious COD discrepancy, rollback/migration failure, lost FCM.

## 17. Testing strategy

### 17.1 Unit

- Price/quote arithmetic; product quantities and offer policy.
- Allowed order transition table and actor authorization.
- Search matching/aliases; service zone predicate; fee rules.
- Payment status event dedup and refund amount bounds.
- Ledger invariants and partner reimbursement calculations.

### 17.2 Integration

- MongoDB test instance **with replica-set support** if transactions are used.
- 2dsphere query nearest partner to market with correct lng/lat.
- Simulated two-partner same-offer accept; only one succeeds.
- Simulated two offers for one partner; only one active assignment.
- Simulate Redis loss/restart while outbox events are pending; BullMQ queue must rebuild without a second order/payment action.
- Test catalogue cache invalidation and stale-while-cache-fails behavior; checkout always validates Mongo prices.
- Test OTP limiter in Redis and fail-closed policy when rate limiter is unavailable.
- Retry order POST with same key; same response/order.
- Webhook duplicate/out-of-order events; no duplicate status/ledger mutation.
- Missing-item approval racing with shopping completion must resolve safely.
- Suspended partner and customer cross-order access denied.
- Order event/outbox persists if process crashes before socket push.

### 17.3 End-to-end

1. Admin configures zone, market and product.
2. Customer app creates COD order; backend quotes exact total.
3. Dispatcher or algorithm offers to partner; partner accepts.
4. Partner marks shopping, proposes missing item, customer approves.
5. Receipt uploaded; market purchase costs recorded.
6. Partner enters delivery OTP; order delivered and financial entries created.
7. Customer web can view same order; admin sees timeline, proof and ledger.
8. Repeat with payment pending, no partner, failed OTP, network loss and admin refund.

### 17.4 Contract and security tests

- OpenAPI/schema contract snapshots consumed by all four apps.
- Rate limiting tests, IDOR, RBAC matrix, malformed GeoJSON, injection, file-upload type validation.
- Resilience: restart worker during offer expiry; provider timeout; Mongo failover/unavailable; stale socket event.
- Backup restoration exercise before launch.

## 18. API and data evolution

- Maintain OpenAPI 3.x source in repository and generate typed clients/contracts where practical.
- Breaking schema changes use explicit /v2 or additive rollout with two-app-release compatibility window.
- Store document version and migration scripts; migrations must be reversible where practical and tested against anonymized data.
- Release backend compatible with current Play Store app versions; mobile upgrades cannot be instantly forced.
- Do not delete legacy fields or enum values until deployed clients are migrated.
- Add audit-friendly schema change records.

## 19. Launch gating / definition of done

- [ ] All P0 endpoints implemented with validation, auth and typed contracts.
- [ ] Order and payment mutations idempotent; monetary arithmetic in paise.
- [ ] Geo market/rider indexes created and verified.
- [ ] Redis is live, authenticated, private, monitored; catalogue cache, OTP limiter and BullMQ worker integration pass tests.
- [ ] No double assignment in concurrent accept test.
- [ ] Shopping substitutions enforce explicit approval and version rule.
- [ ] Receipt and market costs auditable; customer price never silently increased.
- [ ] COD/gateway/refund/payout/reimbursement tracked separately.
- [ ] Worker recovers offer expiry and pending payment from restart.
- [ ] Redis/BullMQ restart recovery and Mongo outbox replay tests pass; no critical state exists only in Redis.
- [ ] Reconnect returns authoritative order, not socket-only state.
- [ ] Admin RBAC and audit logs pass tests.
- [ ] Off-host backup and restore demonstration completed.
- [ ] HTTPS, secrets isolation, error monitoring and release rollback documented.
- [ ] Pilot full-flow UAT from all relevant clients passed.

## 20. Open engineering decisions / ADR proposals

| ADR | Decision | Proposed default | Approval needed |
|---|---|---|---|
| ADR-01 | Backend framework | Express + TS modular monolith | Engineering |
| ADR-02 | Database | MongoDB replica-set, 2dsphere | Engineering/hosting |
| ADR-03 | Background work | Mandatory Redis + BullMQ workers; Mongo transactional outbox | Engineering |
| ADR-04 | Realtime | Socket.IO; Redis adapter/emitter for internal/multi-node; GET-on-reconnect | Engineering |
| ADR-05 | Delivery algorithm | One rider shops/delivers, nearest to market, serial offers | Operations |
| ADR-06 | Price promise | Fixed customer selling price; actual purchase cost internal | Client/finance |
| ADR-07 | Payments | COD P0; verified gateway conditional | Client/finance |
| ADR-08 | Market purchase funding | Company float or documented reimbursement | Client/finance |
| ADR-09 | Hosting | Single VPS pilot + off-host backup | Client/engineering |
| ADR-10 | Refund policy | Written thresholds + role approval | Client/finance |
| ADR-11 | Location tracking | Partner foreground consented P0 | Client/operations |
| ADR-12 | Merchant app | Explicitly excluded from P0 | Client |
| ADR-13 | Cache/rate limit | Redis TTL cache-aside and shared throttling counters | Engineering |
| ADR-14 | Redis resilience | Fail closed for auth limiter; Mongo fallback for catalogue; outbox replay for jobs | Engineering/operations |

**Primary official references:** [MongoDB geospatial](https://www.mongodb.com/docs/manual/geospatial-queries/), [MongoDB atomicity](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/), [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/), [Redis rate limiting](https://redis.io/docs/latest/develop/use-cases/rate-limiter/), [BullMQ queues/workers](https://docs.bullmq.io/guide/introduction), [Socket.IO Redis adapter](https://socket.io/docs/v4/redis-adapter), [Socket.IO delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/), [FCM Android](https://firebase.google.com/docs/cloud-messaging/android/get-started).

