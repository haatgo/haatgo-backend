# TAD 01 — Customer Android Application

**Project:** HaatGo · **Version:** 1.0 draft · **Date:** 14 November 2026  
**Platform:** Android-first bare React Native + **React Native Paper**, Redux, Redux Persist, Redux Saga, Axios, TypeScript; **Community CLI / no Expo**  
**References:** [PRD](PRD.md), [Backend TAD](TAD_05_BACKEND.md), [Design system](references/DESIGN_SYSTEM.md)

## 1. Purpose and architectural boundaries

This app provides catalogue browsing, customer identity, shopping cart, order submission, and order-status tracking. The same customer may also transact on the customer website. Business rules, prices, payment verification, order state and authorization live on the backend, never inside the app.

**Scope:** customer app only; no rider dashboard, merchant UI, admin tools or warehouse logic. Initial Android target; iOS would be a separately scoped native build/test/release track.

### 1.1 Non-negotiable implementation choices

- React Native Community CLI (bare/native), TypeScript and Metro; **do not install Expo or depend on Expo Go, EAS or Expo-managed packages**.
- React Navigation native stack + bottom tabs (verify versions against selected RN release).
- **React Native Paper (Material Design 3)** as the required mobile UI component library; wrap the app with PaperProvider and supply the HaatGo MD3 theme. Use the required native safe-area and icon packages for a bare RN project.
- Redux Toolkit for Redux slices, redux-saga for async orchestration, Axios for HTTP.
- redux-persist for **non-sensitive allowlisted state** with AsyncStorage; sensitive credentials use Android Keystore-backed secure storage through a vetted RN native library.
- Socket.IO client for online order-stage events; FCM via approved bare-RN native integration; Google Maps SDK or external map intent only if provider and consent are configured.
- Use the HaatGo colors, type and spacing through React Native Paper's theme; shadcn/ui is **web-only** and must not be imported into React Native.
- Pin tested exact package versions after verifying the latest stable RN/Android Gradle/NDK compatibility. Avoid unverified “latest everything” dependency mixes.

Official React Native starting reference: https://reactnative.dev/docs/getting-started-without-a-framework

## 2. Context and main flow

~~~mermaid
flowchart TD
    UI["RN Paper screens / components"] --> Store["Redux state + selectors"]
    Store --> Sagas["Redux-Saga flows"]
    Sagas --> API["Axios API client"]
    Sagas --> Sock["Socket/FCM events"]
    API --> Back["Shared backend"]
    Sock --> Back
~~~

Customer flow: onboarding → location → catalogue → product → cart → address → quote/checkout → payment if enabled → confirmation → order tracking → history/support.

## 3. Navigation tree

~~~text
RootNavigator
├── Bootstrap / Splash
├── AuthStack
│   ├── PhoneEntry
│   ├── OtpVerification
│   └── ConsentAndName (if needed)
├── MainTabs
│   ├── HomeStack: Home, CategoryList, ProductList, ProductDetail
│   ├── CategoriesStack: Categories, ProductList
│   ├── SearchStack: Search, Results, ProductDetail
│   ├── OrdersStack: OrderList, OrderDetail, TrackOrder
│   └── AccountStack: Profile, Addresses, Help, Settings
└── ModalStack
    ├── LocationPicker
    ├── Cart
    ├── AddEditAddress
    ├── Checkout
    ├── PaymentSelection
    ├── OrderConfirmed
    ├── SubstituteDecision
    ├── CancellationRequest
    └── ErrorOrRetry
~~~

**Deep links (proposed):** haatgo://orders/{publicOrderId}, haatgo://product/{slug}, https://customer-site/orders/{publicOrderId}. Deep links must authenticate before revealing protected content and validate all identifiers.

## 4. Screen contracts

| Route | Required API inputs/outputs | UI states | Relevant PRD IDs |
|---|---|---|---|
| Splash / bootstrap | GET /v1/me, cached session state | loading, authenticated, guest, expired | CUS-001 |
| Phone / OTP | POST /v1/auth/otp/send; /verify | blank, invalid, rate-limited, submitting | CUS-001 |
| Location | GET /v1/geo/serviceability | permission, manual, valid, unserviceable | CUS-002–003 |
| Home | GET /v1/catalog/home?zoneId | loading, loaded, no-products, zone-closed | CUS-010 |
| Categories | GET /v1/categories | loaded, empty | CUS-010 |
| Product listing | GET /v1/products?zoneId&categoryId&page | filters, pagination, no-results | CUS-010,016 |
| Search | GET /v1/products/search?q= | typing, suggestions, results, empty | CUS-011 |
| Product details | GET /v1/products/:id | available, inactive, quantity-limit | CUS-012–013 |
| Cart | GET/PUT /v1/cart | empty, dirty, synchronizing, price-changed | CUS-013–014 |
| Addresses | GET/POST/PATCH /v1/addresses | selected, validation, save error | CUS-004 |
| Checkout | POST /v1/checkout/quote | current, expired, changed, unserviceable | CUS-020 |
| Payment | POST /v1/orders; /v1/payments/* | COD, online init, pending, failed, success | CUS-021–023 |
| Confirmation | GET /v1/orders/:id | loading, created, pending payment | CUS-024 |
| Tracking | GET /v1/orders/:id and event stream | pending, shopping, delivery, complete, stale | CUS-025,029 |
| Substitute decision | POST /v1/orders/:id/substitutions/:requestId/decision | proposed, approve/reject, expired | CUS-026 |
| Orders / details | GET /v1/orders?page= | loading, empty, list, detail | CUS-025 |
| Help/cancel | POST /v1/support/tickets; /orders/:id/cancel | not allowed, confirm, submitted | CUS-027–028 |

All routes refer to proposed backend endpoint names; [Backend TAD](TAD_05_BACKEND.md) is normative for their shape.

## 5. Suggested code structure

~~~text
haatgo-customer-android/             # independent repository
├── android/                         # committed native Gradle/Kotlin project
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── navigation/{Root,Auth,MainTabs,Linking}.tsx
│   │   ├── store/{store,rootReducer,rootSaga,persist}.ts
│   │   └── bootstrap/
│   ├── features/
│   │   ├── auth/{screens,components,slice,saga,api,types}/
│   │   ├── location/
│   │   ├── catalogue/
│   │   ├── search/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   └── account/
│   ├── shared/
│   │   ├── ui/{PaperButton,PaperInput,ProductCard,Price,EmptyState,Snackbar}/
│   │   ├── services/{apiClient,socket,push,secureStorage}/
│   │   ├── hooks/
│   │   ├── theme/{paperTheme,designTokens}/
│   │   └── utils/{money,units,dates,errors}/
│   └── assets/
├── __tests__/
└── package.json
~~~

Do not import other app folders. Updated 15 November 2026: this is the independent
`haatgo-customer-android` repo, with its own dependencies and local contract/token
snapshots. No shared packages or sibling runtime code. Theme adapters, utilities,
store and native Android code belong only to this repo.

## 6. State management design

### 6.1 Redux slices

| Slice | State | Persist? | Reason |
|---|---|---|---|
| auth | user summary, auth status | **No tokens in Redux** | Access state can be derived from secure session |
| location | selected zone/address ID | Yes (IDs only) | Quick relaunch |
| catalogue | products by ID, fetchedAt, pagination | No | Server pricing changes |
| search | query, filters, result IDs | Query/filters optional | UX convenience |
| cart | item quantities, cartRevision, sync state | Yes as *draft* | Continue interrupted shopping |
| checkout | quoteId, quote expiry, payment mode | No | Quotes are short-lived and sensitive |
| orders | keyed order summaries/statusVersion | No | Must refresh on load |
| ui | toast, sheets, current pending action | No | Transient UI |

**Important:** Redux Persist rehydration must never silently place an order or assume cart prices are still valid. On startup, reconcile persisted cart draft with server cart for authenticated user; display changed lines before checkout.

### 6.2 Saga responsibilities

- authSaga: OTP send/verify, secure token handoff, refresh, sign-out.
- catalogueSaga: takeLatest search/list requests; cancel stale results; debounce search.
- cartSaga: serialize per-item quantity updates or submit a cart revision; retry safely.
- checkoutSaga: quote → review → place order; use one client idempotency key per intent.
- paymentSaga: start gateway, listen to callback, query server verification; do not trust client success boolean.
- ordersSaga: fetch order status, subscribe to Socket.IO room, reconcile after reconnect or app foreground.
- locationSaga: permission flow, manual geocoding/serviceability, stale location handling.
- pushSaga: register/rotate FCM token and navigate from notification after auth check.

Use takeLatest for idempotent reads; use guarded takeLeading or keyed mutex for non-repeatable submit. On sign-out, cancel forked authenticated workers and clear persisted cart/address state as policy dictates.

### 6.3 Axios client

- Base URL from environment build config, never in components.
- Attach access token from secure session manager; refresh in single-flight (one refresh call across concurrent 401s).
- Use AbortController for cancelable reads; reasonable timeouts; typed response/error envelopes.
- For retryable GETs, bounded exponential backoff. Never blindly retry POST order/payment without idempotency key.
- Attach X-Request-Id, X-Client-Version, X-Device-Platform=android; redact tokens and phone numbers from logs.

## 7. Checkout design and invariants

1. Cart contains product IDs and quantities, not trusted selling prices.
2. Call server quote: item price/units, discounts, fee, total, expiry and quoteHash/revision.
3. Customer chooses address/payment and confirms reviewed total.
4. Generate UUID idempotency key once and persist only until result known.
5. POST /v1/orders with quoteId, addressId, paymentMethod, idempotencyKey.
6. COD: show confirmation only when backend confirms order creation.
7. Online: open native gateway UI only if server-created payment order exists; backend verifies signature/webhook and client polls status until terminal.
8. Lost callback/app killed: open Orders / payment status instead of submitting another order.
9. New quote required after expired quote, changed address/fee, or important basket changes.

Money is always formatted from integer paise. Example: 11700 paise → ₹117.00; do not use floating-point arithmetic for final totals.

## 8. Order events, Socket.IO, push, and recovery

- Subscribe after auth only to order-specific authorized channel; server controls membership.
- Event fields: eventId, orderId, sequence, status, occurredAt, serverVersion and optional payload.
- Ignore duplicate eventIds and out-of-order versions.
- **Always GET current order after reconnect/foreground** because Socket.IO events alone are not a durable event feed.
- FCM payload carries safe order reference and event type; sensitive details are fetched from the API.
- Show offline/stale badge when connection lost; last known stage stays visible with timestamp.
- Clear socket subscriptions after logout, account switch and screen lifecycle changes.

## 9. Location and native permissions

- Ask foreground location after a clear “check delivery availability” explanation.
- Manual PIN/address entry is a full alternative.
- Do not request background customer location.
- On Android permission denial/permanent denial, link to Settings if user chooses.
- Maps key stored in appropriate restricted native build config, never a secret API key exposed to client.
- App operates without a map SDK: text address, map external link, stage timeline, supported fallback.
- Respect Android 13+ notification runtime permission where applicable; ask when contextual value is clear.

## 10. Design system and React Native Paper integration

- Build screens primarily with **React Native Paper** components: PaperProvider, Button, Text, TextInput, Searchbar, Card, Chip, Badge, Divider, List, Dialog, Portal, Snackbar, ActivityIndicator and ProgressBar. Use RN View/FlatList/Pressable for performant layout/custom product controls not provided by Paper.
- Configure an **MD3LightTheme** extension with HaatGo colors, typography and component-level variants. Set primary action to accessible green #0E7547, decorative brand green #168B56, secondary/saffron #F6A21B and surface #FFF9F1.
- The **Redux Provider wraps PaperProvider**, so modals rendered through Paper Portal can see Redux context; navigation lives inside them.
- In a vanilla RN CLI project, install and configure react-native-safe-area-context and the currently supported Material Design icon package explicitly. Do not use Expo vector icon imports.
- Maintain matching visual behavior across both mobile apps using independently implemented MD3 theme adapters and local token copies; avoid inconsistent default Material purple accents.
- Tokens: primary brand #168B56; interactive green #0E7547 (white text contrast); saffron #F6A21B; ivory #FFF9F1; dark ink #1C312C.
- Base 390 dp layout, test 320/360/390/430 dp widths and OS font scaling.
- Press areas ≥ 48 dp; high-contrast labels for quantity/add.
- Bottom navigation Home, Categories, Search, Orders, Account; separate contextual cart shortcut.
- States for every screen: loading/skeleton, empty, network error, retry, action pending, accessibility focus.
- Replace illustrative contact-sheet images/brand packaging with licensed product assets.

## 11. Failure handling by screen

| Failure | UI response | Technical response |
|---|---|---|
| OTP provider unavailable | Resend later + explanation | Rate-limit-aware error; no infinite retry |
| Zone unserviceable | Location change CTA | Do not allow quote |
| Cart item removed | Clear explanation of removed item | Revalidate cart revision |
| Payment pending | Check payment status | Poll server; webhook authoritative |
| Order request timeout | Search existing request by idempotency key | Do not create another order |
| No rider | “Finding a delivery partner”; support | Back-end escalation; status updates |
| Substitute expires | Show item removal or support outcome | Refresh order version |
| Live updates disconnect | Show “Last updated…” | GET latest state on reconnect |
| App killed in checkout | Restore relevant cart, refresh quote | No duplicate transaction |

## 12. Testing strategy

- **Unit:** reducers, selectors, money formatting, quantity limits, request error mapping.
- **Saga:** OTP retry, takeLatest cancellation, idempotent order submit, stale quote handling, logout cancellation.
- **Component:** product-card quantity stepper, cart fee rows, address form, tracking states.
- **Integration:** mocked Axios flows, payment callbacks, socket sequence handling, push deep links.
- **E2E device:** Maestro or Detox for login → browse → cart → COD checkout → order history, permission denied, offline resume.
- **Device matrix:** low/mid-range Android, small 320/360 dp, Android version support, low memory, poor bandwidth.
- **Release:** signed AAB, package name and Play declarations, keystore protection, versionCode, staged rollout, crash monitoring.

## 13. Non-functional and security

- Main product list scroll should remain responsive on mid-range Android; paginate and virtualize.
- No payment gateway secret, OTP secret or backend admin key in app build.
- Store auth secrets only through Android Keystore-backed storage; clear on logout.
- Do not log full addresses, photos, tokens, phone numbers or raw payment payloads.
- Require TLS; reject unsupported insecure builds in production.
- Provide session-expired recovery and protect deep-linked order details by server authorization.
- Use a privacy policy accurately describing location and notification use.

## 14. Definition of done

- [ ] No Expo modules, Expo app metadata or EAS dependency.
- [ ] React Native PaperProvider + repo-local MD3 theme controls every standard mobile form/dialog/button.
- [ ] Redux Persist, Redux Saga and Axios have integration tests for auth, cart and checkout.
- [ ] Four principal flows work: login/location, catalogue/cart, COD order, tracking/history.
- [ ] All navigation screens have empty/loading/error states.
- [ ] Checkout price is backed by server quote; repeat tap cannot duplicate order.
- [ ] Login, socket, notification and sign-out lifecycle are tested.
- [ ] Manual location works when GPS is denied.
- [ ] UAT-01, UAT-02, UAT-03, UAT-05, UAT-06 and UAT-08 pass.
- [ ] Crash-free release candidate and signed Android build delivered.

## 15. Dependencies / decision requests

- Final app/package ID, Play Console owner and signing arrangement.
- Final catalogue data, local zone and support phone.
- Online payment scope and gateway test/live credentials.
- Provider choice for native maps/FCM/secure storage and approved Android SDK versions.
- Whether cart must synchronize automatically between customer web and Android app.

**Official references:** [Bare React Native setup](https://reactnative.dev/docs/getting-started-without-a-framework), [React Native Paper getting started](https://oss.callstack.com/react-native-paper/docs/guides/getting-started), [Paper theming](https://oss.callstack.com/react-native-paper/docs/guides/theming), [React Navigation](https://reactnavigation.org/docs/getting-started/), [Redux Toolkit](https://redux-toolkit.js.org/usage/usage-guide/), [Redux-Saga](https://redux-saga.js.org/docs/introduction/GettingStarted/), [FCM Android](https://firebase.google.com/docs/cloud-messaging/android/get-started).

