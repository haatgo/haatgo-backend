# TAD 02 — Delivery-Partner Android Application

**Project:** HaatGo · **Version:** 1.0 draft · **Date:** 14 November 2026  
**Platform:** Bare React Native Community CLI + **React Native Paper** + Redux/Persist/Saga/Axios + TypeScript; **no Expo**  
**References:** [PRD](PRD.md), [Backend TAD](TAD_05_BACKEND.md), [Design system](references/DESIGN_SYSTEM.md)

## 1. Mission and scope

The partner app is a guided **shop-then-deliver** workflow, not a conventional warehouse pickup app. The same assigned partner visits one approved local market, buys a checklist of items, records unavailable products/substitutions and purchase evidence, then delivers to the customer with a server-verified OTP.

P0 supports one **active** job per partner. No multi-order batching, route optimization across customer drops, merchant POS syncing, or rider wallet in the MVP.

### 1.1 Implementation stack

- Bare React Native Community CLI, TypeScript, native Android Gradle/Kotlin project committed to repository.
- React Navigation native-stack and bottom tabs.
- **React Native Paper (MD3)** for partner UI; a repo-local PaperProvider theme maps the owned HaatGo green/saffron/ivory token copies to native components.
- Redux Toolkit + redux-saga + Axios; redux-persist for safe, non-secret local drafts; secure Android Keystore-backed storage for session tokens.
- Socket.IO client + FCM native integration for offers, assignment expiry, order progress and substitutions.
- Native geolocation only while permissioned; open Google Maps or installed navigation app via Android intent. Embedded map SDK is optional for MVP.
- Android camera/image picker for photo proof; use restricted permission scope or platform Photo Picker rather than broad media access when possible.
- Foreground service/background tracking only if explicitly authorized, policy-reviewed and needed; P0 can update location while app is foreground and require periodic heartbeat.
- **No Expo packages, Expo Go or EAS.**

## 2. Business state vs UI state

### 2.1 Partner availability

| State | Meaning | Can receive offer? |
|---|---|---|
| pending_review | Signup not approved | No |
| approved_offline | Approved but unavailable | No |
| available | Approved, online, heartbeat fresh, no active job | Yes |
| offer_pending | One unexpired assignment offer | Not another P0 offer |
| busy | Accepted shopping/delivery task | No |
| suspended | Ops restriction | No |
| stale | Heartbeat no longer current | No until reconnection |

This state is **server-owned**; app local Online toggle is a request, not an authoritative switch.

### 2.2 Job workflow

~~~mermaid
stateDiagram-v2
    [*] --> Available
    Available --> OfferPending: assign offer
    OfferPending --> Available: decline or expire
    OfferPending --> Accepted: valid accept
    Accepted --> TravelingToMarket
    TravelingToMarket --> Shopping
    Shopping --> ApprovalPending: missing item
    ApprovalPending --> Shopping: decision
    Shopping --> Purchased
    Purchased --> OutForDelivery
    OutForDelivery --> Delivered: verified OTP
    Delivered --> Available: settle and release
~~~

Exceptions: order cancelled, partner accident/incident, market closed, receipt rejected, customer unreachable, device offline. The backend owns legal transitions and audit history.

## 3. Navigation and screen inventory

~~~text
Root
├── Bootstrap
├── Auth: Phone, OTP, ApprovalPending, Suspended
├── MainTabs: Home, Orders, Earnings, Profile
├── ActiveJobStack
│   ├── IncomingOffer
│   ├── MarketRoute
│   ├── MarketArrival
│   ├── ShoppingChecklist
│   ├── MissingItem / SubstituteRequest
│   ├── ReceiptUpload
│   ├── PurchaseReview
│   ├── CustomerRoute
│   ├── DeliveryOTP
│   └── CompletionSummary
└── Support: IncidentReport, Help, ContactOps
~~~

The partner board has ten composite visual frames; production navigation needs separate approval, incident, profile and offline states beyond the contact sheet.

| Screen | Data | Main action | Edge case |
|---|---|---|---|
| Login/OTP | phone, role, approval | Verify | Partner pending/suspended |
| Home | online/busy, daily stats | Toggle availability | No GPS/FCM, stale heartbeat |
| Offer | offerId, expiryAt, earnings, market and zone | Accept/Decline | Already expired/taken |
| Market route | market name/address/coords | Open navigation, mark arrived | Market closed |
| Checklist | itemId, pack, qty, target cost, picked | Mark bought/missing | Stale/changed order |
| Substitute | proposed SKU, selling price delta, deadline | Send request / wait | Rejected or timed out |
| Purchase review | actual items, costs, image proof | Submit receipt | Upload failure |
| Customer route | address/instructions, contact permissions | Navigate | No GPS, unreachable |
| Delivery proof | order OTP, failure reasons | Verify OTP | Incorrect/expired OTP |
| Earnings/history | payout statuses and history | View detail | Disputed reimbursement |

## 4. Architecture and code organization

~~~text
haatgo-driver-android/              # independent repository
├── android/
├── src/
│   ├── app/{navigation,bootstrap,store}
│   ├── features/
│   │   ├── auth/{screens,slice,saga,api}
│   │   ├── availability/
│   │   ├── offers/
│   │   ├── assignments/
│   │   ├── shopping/
│   │   ├── substitutions/
│   │   ├── receipts/
│   │   ├── delivery/
│   │   ├── earnings/
│   │   └── incidents/
│   ├── services/{axios,secureSession,socket,push,location,photoQueue}
│   ├── shared/{paperUi,types,paperTheme,formatters}
│   └── assets/
└── __tests__/
~~~

Updated 15 November 2026: this independent repo owns its dependencies, lockfile,
DTO snapshots, token copies, formatters, theme adapter and feature code. No shared
packages, sibling imports or linked node_modules. Contract/token/reference copies
propagate only through the optional local coordinator. Partner screen actions use
Paper Button, Card, Chip, TextInput, List, Dialog, Portal, Snackbar and ProgressBar;
the timer and shopping checklist may use custom accessible RN layouts.

**Paper provider composition:** Redux Provider → React Native PaperProvider (custom MD3 theme) → NavigationContainer/partner routes. This lets Paper modal/portal content access Redux state. Bare RN setup needs native safe-area and icon dependencies; no Expo icon package.

### 4.1 State slices and persistence

| Slice | Examples | Persist? |
|---|---|---|
| session | partner identity/approval | Non-secret summary only |
| availability | requested online, server status, heartbeatAt | **No authoritative flag** |
| offers | current offerId, expiryAt, details | No; refetch on resume |
| activeJob | order snapshot, version, stage | Small ID/version only |
| shoppingDraft | item checked state and pending mutation IDs | Yes, encrypted if contains sensitive context |
| substitutions | pending request/decision | No; refetch |
| receipt | local photo staging URI, upload progress | Temp file metadata only, clean promptly |
| earnings | summaries and history | No; always re-fetch |
| ui | alerts, modals, busy indicators | No |

Never persist raw session tokens in AsyncStorage/Redux Persist. Address and customer phone should not remain in local draft after delivery/logout.

### 4.2 Saga workers

- bootstrapSaga: unlock secure session, fetch current partner status/active task.
- availabilitySaga: request online/offline, reconcile server status, send heartbeat if foreground and permitted.
- offerSaga: subscribe to offer events, fetch offer details, enforce countdown based on **server expiryAt**, guard accept taps.
- assignmentSaga: load current task and stage; watch version updates; recover after reconnect.
- shoppingSaga: serialize checklist mutations and upload drafts with unique operationId; request server review.
- substitutionSaga: submit proposal, await server/customer decision, timeout to escalation.
- receiptSaga: compress and stage photo, upload using signed URL, attach object key, confirm purchase.
- deliverySaga: navigate, verify server OTP, report exception, show completion.
- earningsSaga: fetch payout entries and settlement status.

Avoid takeLatest for critical mutation submit when its cancellation could hide an in-flight server write; use takeLeading/mutex and refresh resulting state.

## 5. Assignment and offer contract

### 5.1 Receiving an offer

Socket event proposal:

~~~json
{
  "eventId": "evt_...",
  "type": "partner.offer.created",
  "offerId": "ofr_...",
  "orderId": "HG-...",
  "market": {"name": "Gariahat Market", "lat": 22.5, "lng": 88.37},
  "customerArea": "Ballygunge",
  "itemCount": 6,
  "estimatedPayoutPaise": 14200,
  "expiresAt": "2026-11-14T12:34:56Z",
  "serverVersion": 3
}
~~~

This JSON is an illustrative **contract draft**. Backend types, payload minimization and validation are normative.

- Count down using serverTime/expiresAt, not a local arbitrary 20-second timer.
- On accept: POST /v1/partner/offers/:id/accept with idempotency key and expected offer version.
- Server returns accepted assignment or **409 stale/claimed/partner busy**. UI cannot assume success because tap occurred.
- Offer expiry, partner availability and existing assignments are checked in a server atomic operation.
- If a push arrives after offer expiry, opening app shows “Offer no longer available” and the live home.

### 5.2 Stale heartbeat/permission

- Online state requires up-to-date permission and heartbeat.
- When GPS denied, allow partner to view history/support but block new offers if the operating policy requires live location.
- Foreground-only P0: location heartbeat while online and active screen; server auto-offlines stale partners.
- Background tracking is a separately approved native service, notification, battery, privacy and Play policy workstream.

## 6. Shopping checklist and local-market sourcing

### 6.1 Item fields

Each checklist row: orderLineId, productId, localized name, requested quantity/unit, customer selling price **for reference only**, maximum/target purchase price if policy provides, bought quantity, actual market cost, status (pending/bought/missing/substituted), notes, operation version.

**Do not confuse selling price and purchase cost.** Partner typically needs the expected market budget/allowed price, not secret platform margin.

### 6.2 Checkpoint sequence

1. Partner marks **Arrived at market**, server records time.
2. Partner can mark items bought or unavailable individually.
3. For missing item, partner proposes a predefined substitute if permitted, with actual price and photo only when required.
4. Customer decides; approval is attached to requestId and orderVersion. Partner **must not purchase unapproved substitute**.
5. Partner records actual quantities and purchase costs; platform enforces limits.
6. Partner takes readable receipt photo and reviews all items.
7. Only when required items/decisions/proof are complete can “Shopping completed” be submitted.
8. Backend snapshots receipt, purchase-cost total, accepted substitutions and order stage.
9. Partner proceeds to delivery; admin can inspect discrepancies.

### 6.3 Strict substitution states

| State | Partner action | Backend rule |
|---|---|---|
| proposed | Wait / contact support | Customer decision pending |
| accepted | Buy exactly approved SKU/qty | Confirm approval version |
| declined | Remove/choose policy fallback | Cannot buy rejected alternative |
| expired | Contact operations | No implied consent |
| settled | Purchase recorded | Immutable change history |

In fixed-price P0 model, avoid higher-priced substitute without a separate consent/payment authorization flow.

## 7. Offline resilience

Network quality around markets may be poor; design explicit offline behavior:

- Draft checklist ticks and actual-cost entries can be queued in encrypted temporary local storage with operationId, orderId, baseVersion, clientTimestamp.
- **Do not queue** accept-offer, payment mutations, delivery OTP verification, approval decisions or irreversible “completed” transitions offline.
- On reconnect fetch current assignment/orderVersion, compare expected version and replay only safe checklist mutations idempotently.
- Conflict response shows “Your list changed; review before continuing” rather than silently overwriting.
- Uploaded photo must be associated with one receiptUploadId and one order. Use checksum/reuse uploadId after retry.
- Purge customer contact, local proof images and draft state after confirmed completion and retention window.

## 8. Photo proof and upload design

- Capture/photo picker → resize/compress (reasonable quality, readable receipt) → strip unnecessary EXIF location → local preview → upload.
- Backend issues short-lived signed PUT URL or accepts restricted multipart upload; protect storage path ownership.
- Client sends mimeType, byteSize, checksum; backend validates upload state, object metadata, file-size/type limits.
- A receipt should support re-capture, reject reason, retry and a manual incident if market doesn't provide paper receipt.
- No unbounded retry loop consuming mobile data; allow explicit upload retry.
- Never trust cost totals derived from OCR; no OCR dependency in P0.

## 9. Customer delivery and proof

- Show address only after accepted assignment. Provide “navigate” intent with market or customer destination.
- Call support/customer through policy-approved channel, preferably masked in future; keep access logged.
- At doorstep, enter 4–6 digit one-time code provided by customer; server validates against salted hash/expiry and attempt count.
- Wrong OTP shows remaining attempts or cooldown, without exposing expected value.
- If no OTP/customer absent, report incident; only approved supervisor override can complete with reason and additional evidence.
- Completion response includes deliveredAt, settlement state and next availability.

## 10. Earnings and money separation

The partner app can show:

- **Estimated payout** at offer time.
- **Final payout** after completion and admin settlement rules.
- **Market purchase reimbursement** if the partner used personal funds/float, as a **separate ledger entry**.
- **COD collection** as a separate amount the partner owes the business.
- **Payout status**: estimated → earned → approved → paid/held/disputed.

Never show total order revenue as partner earnings. No automatic cash/wallet balance unless a ledger/finance policy exists.

## 11. Security and privacy

- Secure session token storage; TLS; no secrets in mobile bundle.
- Server checks partner approval, current assignment and order ownership for every mutating endpoint.
- Only minimum customer information is shown; hide after completion.
- Foreground location consent and granular permissions; no stealth continuous tracking.
- Signed upload URLs short-lived; photo metadata sanitized; app cache cleaned after job.
- Rooted device handling/Play Integrity can be considered later; not a replacement for server authorization.
- Rate-limit OTP and delivery verification; redact customer data in analytics and crash logs.

## 12. Notification and event handling

| Event | Foreground | Background/terminated | Recovery |
|---|---|---|---|
| New offer | Socket card with timer | FCM notification with offer ID | GET current offer, check expiry |
| Offer revoked | Remove card | Safe notification update | Refresh server status |
| Customer substitution decision | Update checklist | FCM actionable prompt | GET request/order version |
| Assignment reassigned | Stop old flow | Inform partner | Fetch current active job |
| Support instruction | In-app banner | FCM | GET incident detail |
| Settlement completed | Earnings refresh | Optional push | GET payout entries |

Socket.IO defaults do not guarantee replay of every missed event; store event versions and refetch authoritative state on resume.

## 13. Performance and power

- Avoid continuous high-accuracy GPS in P0; throttle/update based on activity and operating rule.
- Don't remount map or full shopping list on each timer tick; isolate offer countdown.
- Use optimized images in product checklist and virtualized lists for large orders.
- Compress proof photos and limit concurrent uploads.
- Clean up listeners and location watches on navigation, logout, offline status and task completion.
- Notification actions must not inadvertently accept an order without server confirmation.

## 14. Test plan

| Category | Cases |
|---|---|
| Unit | Offer timer using server time, availability selector, amounts in paise, checklist reducer |
| Saga | Expired offer, accept conflict, stale stage event, offline queue replay |
| UI | Small screens, long Bengali product names, large fonts, failed photo upload |
| Integration | Server assignment, receipt proof, substitute rejection, OTP verification |
| Security | Unauthorized order read, unapproved partner offer, OTP brute-force rejection |
| E2E | Online → accept → shop → missing item → approved substitute → receipt → OTP delivery |
| Resilience | Kill app mid-offer, airplane mode mid-shop, reinstall after assignment, bad GPS |
| Finance | Final payout ≠ purchase reimbursement ≠ COD amount; server ledger match |
| Release | Signed Android AAB, notifications, location rationale, crash reports |

## 15. Release checklist / definition of done

- [ ] Bare React Native Android build with no Expo dependency.
- [ ] React Native Paper's MD3 theme is consistent with customer app, including accessible buttons, checklist rows and dialogs.
- [ ] Redux Persist/Saga/Axios integrations tested with offline shopping and offer conflicts.
- [ ] Approval statuses and online/offline states enforced server-side.
- [ ] Duplicate or expired accept returns unambiguous failure.
- [ ] Shopping cannot complete with unresolved required rows.
- [ ] Substitute action respects customer approval; higher-price rule enforced.
- [ ] Receipt submission is secure and retry-safe.
- [ ] Delivery completion requires server OTP or audited operator exception.
- [ ] Android permissions and no-location fallback behavior reviewed.
- [ ] Earnings, reimbursement and COD display separate values.
- [ ] UAT-04, UAT-05, UAT-07, UAT-08, UAT-09 and UAT-10 pass.

## 16. Dependencies and open questions

- Partner reimbursement / cash float policy (must be decided **before** production).
- Required partner KYC, documents, consent forms and insurance/incident policy.
- Availability of receipt paper in target markets and fallback evidence procedure.
- Whether foreground-only GPS is operationally enough for pilot dispatch.
- Exact offer timeout, radius, reassignment and cancellation rules.
- Actual payout schedule and adjustment/dispute process.

**Official references:** [Bare RN](https://reactnative.dev/docs/getting-started-without-a-framework), [React Native Paper](https://oss.callstack.com/react-native-paper/docs/guides/getting-started), [Paper theming](https://oss.callstack.com/react-native-paper/docs/guides/theming), [FCM Android](https://firebase.google.com/docs/cloud-messaging/android/get-started), [React Navigation](https://reactnavigation.org/docs/getting-started/), [Socket.IO delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/).

