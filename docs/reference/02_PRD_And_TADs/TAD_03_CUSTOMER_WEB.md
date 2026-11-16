# TAD 03 — Responsive Customer Website

**Project:** HaatGo · **Version:** 1.0 draft · **Date:** 14 November 2026  
**Audience:** Mobile-web-first Indian customers; desktop/tablet supported  
**Required stack:** **React + TypeScript + Vite + shadcn/ui + Tailwind CSS + Redux (Redux Toolkit) + Redux Persist + Redux Saga + Axios**  
**References:** [PRD](PRD.md), [Backend TAD](TAD_05_BACKEND.md), [Design system](references/DESIGN_SYSTEM.md)

## 1. Architecture decision

The customer website is a separate deployable React SPA that consumes the exact same customer-facing backend contracts as the bare React Native customer app. The API, not the web session, owns prices, cart revisions, payment verification and order state.

We use Vite for static SPA build and shadcn/ui for accessible composable web components. Redux Toolkit creates reducers/selectors; Redux Saga owns async workflows; Axios makes HTTP requests; Redux Persist saves a small non-sensitive allowlist. **Do not introduce RTK Query or React Query as a second competing fetch layer for MVP** unless a separate decision is recorded.

Current official shadcn Vite setup: https://ui.shadcn.com/docs/installation/vite

## 2. Page and route map

| Route | View | P0 content | Authentication |
|---|---|---|---|
| / | Home | Delivery zone, search, categories, offers, products | Public |
| /categories | Categories | Category tiles/list | Public |
| /category/:slug | Product listing | Filtering, sorting, paging | Public |
| /search?q= | Search | Query, suggestions, results | Public |
| /product/:slug | Product detail | Selling price/pack, Add, availability | Public |
| /cart | Cart | Lines, estimated fees, quantity | Guest draft or auth |
| /address | Addresses | Select/add/edit, serviceability | Auth |
| /checkout | Checkout | Quote, fees, payment, confirm | Auth |
| /order/confirmed/:publicId | Confirmation | Order created and next status | Auth/order owner |
| /orders | Order history | Recent orders and filters | Auth |
| /orders/:publicId | Order detail/tracking | Timeline, substitution, partner info | Auth/order owner |
| /account | Profile | Name, phone summary, addresses | Auth |
| /help | Support | FAQs, ticket, contact | Public/conditional |
| /login | OTP login modal/page | Send and verify OTP | Guest |

Mobile navigation should approximate app discovery while retaining browser semantics. URLs are meaningful, reload-safe and shareable when public; protected deep links redirect to login and return after verification.

## 3. Presentation architecture

~~~mermaid
flowchart TD
    Pages["React routes"] --> UI["shadcn/ui + feature components"]
    Pages --> Redux["Redux Toolkit selectors"]
    Redux --> Saga["Redux Saga"]
    Saga --> Axios["Axios service layer"]
    Saga --> Socket["Socket.IO subscriptions"]
    Axios --> API["Shared backend"]
    Socket --> API
~~~

### 3.1 Design and responsive rules

- Mobile-first design from **320 px** up, reference 390 px, test 360/390/430/768/1024/1440.
- Customer content max width ~1280 px; desktop header with location, search, account and cart.
- Mobile header: location line and search; bottom navigation Home, Categories, Search, Orders, Account if appropriate.
- Product grids: 1–2 mobile columns, 2 tablet, 3–5 desktop; no horizontal scrolling of cart totals/checkout CTA.
- Filters: drawer/sheet on mobile, sidebar on desktop; preserve parameters in URL.
- Cart: full responsive route for accessibility; optional desktop cart drawer should link to full route.
- Use the UI kit's HaatGo token values. Button text on CTA must use accessible dark green #0E7547, not lighter decorative #168B56.
- Headless accessible components: shadcn Button, Input, Sheet, Dialog, Tabs, Card, Skeleton, Badge, Select, Form, Alert, Table as needed.

## 4. Repository structure

~~~text
haatgo-customer-web/                 # independent repository
├── index.html
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   ├── store/{index,rootReducer,rootSaga,persist.ts}
│   │   └── styles.css
│   ├── components/ui/              # shadcn-generated source
│   ├── features/
│   │   ├── auth/{pages,components,slice,sagas,api}
│   │   ├── location/
│   │   ├── catalogue/
│   │   ├── search/
│   │   ├── cart/
│   │   ├── addresses/
│   │   ├── checkout/
│   │   ├── orders/
│   │   └── support/
│   ├── shared/{components,services,formatters,validators,hooks}
│   └── assets/
├── tests/
├── vite.config.ts
├── components.json
└── package.json
~~~

Updated 15 November 2026: use the independent `haatgo-customer-web` repository.
DTO snapshots, currency/validation helpers, components, design copies, dependencies
and lockfile belong to this repo. No common monorepo packages or sibling imports.
Only contract/token/reference artifacts propagate through the optional local coordinator.

## 5. Redux Toolkit, Persist and Saga design

### 5.1 Store shape

~~~ts
type RootState = {
  session: { status: "guest" | "checking" | "authenticated"; userId?: string };
  zone: { zoneId?: string; pincode?: string; selectedAddressId?: string };
  catalogue: { entities: Record<string, ProductDto>; loading: boolean };
  search: { query: string; filters: SearchFilters; resultIds: string[] };
  cart: { lines: CartLineDraft[]; revision?: number; syncState: SyncState };
  checkout: { quote?: QuoteDto; submitting: boolean; error?: ApiError };
  orders: { byId: Record<string, OrderDto>; activeOrderId?: string };
  ui: { banner?: string; dialog?: string };
};
~~~

Suggested persist whitelist: zone selected non-sensitive ID and pre-login cart draft. **Do not persist** access tokens, refresh tokens, full addresses, full order history, finance, cached gateway responses or admin-like data. On logout purge user-specific drafts; on auth restore cart through server merge/revalidation.

### 5.2 Middleware setup

~~~ts
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sagaMiddleware),
});

const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);
~~~

This is illustrative. Import functions/constants from the correct current packages; verify compatibility and types in the actual repo.

### 5.3 Saga rules

| Flow | Saga pattern | Notes |
|---|---|---|
| Search input | debounce/takeLatest | Ignore stale responses |
| Zone change | takeLatest + clear catalogue query | Cart must be revalidated |
| Add to cart | serialize per cart revision | Prevent race/lost quantity |
| Fetch quote | takeLatest by cart snapshot | Expired responses invalid |
| Place order | guarded takeLeading | Idempotency key; no duplicate order |
| Payment verify | one in-flight verification worker | Server is authoritative |
| Order tracking | eventChannel / reconnect fetch | Ignore stale event versions |
| Logout | cancel child tasks + reset | Purge PII/persisted state |

### 5.4 Axios client

- Central client with base URL from Vite environment config, explicit timeout, JSON normalization and typed response envelope.
- Access token preferably kept in memory with refresh in secure httpOnly/SameSite cookie flow where backend supports it; never put long-lived refresh token in localStorage.
- If cookies are used: include credentials only for trusted origin; enforce CSRF and correct SameSite/Secure/CORS.
- Attach requestId and Idempotency-Key for payment/checkout mutations; an Axios interceptor must not retry non-idempotent requests without a key.
- Handle 401 via single-flight session refresh, then replay safe request once; auth failure routes to login without losing user intention.
- Abort obsolete GETs, provide localized errors and explicit retry.

## 6. Data and form contracts

### 6.1 Catalogue and cart

- API product DTO: productId, slug, name, aliases, images, category, unit/pack, pricePaise, active/orderable, maxQuantity.
- Cart draft: productId, requestedQuantity; server computes actual line prices and fees.
- Delivery zone must be present in catalogue/quote API calls and validated on server. UI must not infer zone solely from GPS.
- Search query/filters are URL state; Redux may mirror for component convenience but URL is canonical for back/forward navigation.
- Use Intl.NumberFormat for INR and formatted units; backend money always integer paise.

### 6.2 Checkout contract

1. GET selected address and latest cart revision.
2. POST /v1/checkout/quote.
3. Render line-by-line quote, fees and total; show quote expiry if important.
4. Collect payment method and confirm user reviewed total.
5. POST /v1/orders with idempotency key. Only server confirms order.
6. COD: route to order confirmation.
7. Prepaid: start server-issued gateway order, gateway UI; await backend verification. Redirect/refresh should recover via order status.
8. On invalidated price/zone: show changed quote and require an explicit re-confirmation.

### 6.3 Substitution and order status

- Websocket subscribes to owner-authorized order room, not arbitrary order IDs.
- On reconnect, GET current order (events may have been missed).
- Substitute dialog shows original SKU, proposed SKU, quantity, price delta and deadline; approve/reject posts expected version.
- Live tracking map is optional; timeline is always available.
- Keep in-progress order easy to reopen from Orders and via safe deep link.

## 7. Authentication and web security

- Phone OTP login, server-driven resend cooldown, attempt and IP/device rate limits.
- Session bootstrap before rendering sensitive routes; 401 / forbidden pages distinguish session lapse from wrong owner.
- Prefer short-lived access in memory and refresh cookie with proper SameSite/CORS/CSRF policy; validate cross-origin assumptions with deployment topology.
- Sanitize/escape user-visible strings, avoid dangerous HTML injection, configure CSP and secure response headers.
- No payment provider secret or maps server key in browser bundle.
- Validate every route/API permission server-side; client route guards are UX only.
- Avoid rendering customer addresses/phone in analytics events and browser localStorage.

## 8. SEO, performance and analytics

- Vite CSR can deliver an MVP; note that organic SEO on dynamic product pages is limited without SSR/prerendering. Do not promise search rankings.
- Render meaningful title/meta for home and static content; add robots/sitemap for public routes and noindex for account/checkout/order pages.
- Lazy-load route chunks, product images, heavy map library and payment SDK.
- Use virtualized lists only if catalogue density warrants them; normal pagination may be simpler initially.
- Collect funnel events without PII: zone_checked, search_performed, item_added, quote_requested, order_placed, payment_verified, order_delivered.
- Monitor web vital metrics (LCP, INP, CLS), API failures and checkout abandonment by stage.

## 9. Error, loading and offline design

| Scenario | Web UI | System action |
|---|---|---|
| Product list slow | Skeleton/grid preserved | Abort obsolete request, retry |
| Invalid PIN | Inline error + manual correction | No quote |
| Price change | Old/new item line and confirm | New quote required |
| Checkout double-click | Disabled button + spinner | Same idempotency key |
| Payment redirect lost | Pending status with check again | Verify on backend |
| Internet lost | Offline banner, cart draft retained | No silent order placement |
| Socket drops | “Last updated” marker | GET current order on reconnect |
| Address invalid | Field-specific error | Server validation |

## 10. Verification matrix

- Unit: reducers/selectors, money, fee display, cart reconciliation, URL filters.
- Saga: debounced search, auth refresh, duplicate checkout guard, payment recovery.
- Component: shadcn accessibility, dialogs, cart sheet, error states, long item names.
- Integration: MSW or equivalent API mocks, auth refresh, backend order contract.
- E2E: Playwright mobile 390px and desktop 1440px login → browse → COD → order status; forced payment callback loss.
- A11y: keyboard flow, focus trap in Dialog/Sheet, contrast, labels, screen reader, reduced motion.
- Security: open redirect, sensitive browser storage, CSRF/cookie behavior, unauthorized order route.
- Browser: supported evergreen Chrome/Edge/Safari/Firefox and Android Chrome baseline.
- Build: typecheck, lint, test, build, route smoke, static asset cache policy.

## 11. Deployment and release

- Build static Vite assets; host under configured customer subdomain behind HTTPS and Nginx/CDN as chosen.
- Environment splits: local, staging, production API origin; no secrets in VITE_* environment variables.
- Client-side router fallback to index.html for routes, but do not rewrite API/static 404s.
- Fingerprinted assets can cache long-term; index.html short cache; purge on release if necessary.
- Health signal uses backend status separately from static frontend availability.
- Rollback to prior static release artifact; coordinate with backward-compatible API contracts.

## 12. Definition of done

- [ ] Uses React + TypeScript + shadcn/ui + Tailwind + Redux Toolkit + Redux Persist + Redux Saga + Axios.
- [ ] Matches mobile-first UI kit, usable at 320, 390 and 1440 px.
- [ ] Guest can browse and find serviceability; auth prompts only when needed.
- [ ] Cart/quote/checkout identical in rules to Android customer app.
- [ ] COD checkout is idempotent; online checkout recovery tested if enabled.
- [ ] Ownership enforced for orders/addresses.
- [ ] All dialogs, forms, filters and keyboard paths accessible.
- [ ] Production route fallback, HTTPS and errors monitored.

**Primary technical references:** [shadcn/ui Vite](https://ui.shadcn.com/docs/installation/vite), [Redux Toolkit](https://redux-toolkit.js.org/usage/usage-guide/), [Redux-Saga](https://redux-saga.js.org/docs/introduction/GettingStarted/), [Axios](https://axios-http.com/docs/intro), [Socket.IO delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/).

