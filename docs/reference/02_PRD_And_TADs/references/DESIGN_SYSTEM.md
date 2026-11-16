# HaatGo — Detailed UI Design System & UX Specification

**Version:** 1.0 · **Prepared:** 14 November 2026  
**Status:** Visual concept / developer handoff  
**Platforms:** Android-focused React Native mobile apps, responsive React customer website, and React admin dashboard  
**Audience:** Customers in Indian neighbourhoods, delivery partners shopping in nearby markets, and operations/admin staff

> **Important:** This document captures the design direction shown in five AI-generated contact sheets. It is not a claim that all implementation requirements are approved. Screens contain mock prices, names, addresses, times, metrics, maps and text. Use the product rules in this document, then confirm the open business decisions before development.

---

## 1. Product model, goals and scope

### 1.1 Product thesis

HaatGo is an India-first hyperlocal shopping experience. Customers order everyday essentials from a curated digital catalogue; a delivery partner visits a nearby **existing local market**, purchases the items and delivers them. The MVP does **not** assume a warehouse or dark store.

### 1.2 Primary UX outcomes

1. Let a customer identify a serviceable delivery area before they browse.
2. Make fresh categories and quantity/price information easy to compare.
3. Get from adding an item to placing an order with minimum friction.
4. Transparently show that a partner is **shopping at market**, then **delivering**.
5. Help partners shop accurately with a clear checklist and substitution process.
6. Give operations staff order, market, product, partner and exception controls.

### 1.3 Channels covered

| Surface | Principal user | Device priority | Core experience |
|---|---|---|---|
| Customer mobile app | Shopper | Android 360–430 dp | Browse → cart → checkout → tracking |
| Delivery-partner mobile app | Shopper/rider | Android 360–430 dp | Accept → market → shop → deliver |
| Customer website | Shopper | Mobile browser first, then desktop | Same transactional flow as customer app |
| Admin website | Operations manager | Desktop 1280–1600 px, tablet fallback | Catalogue, orders, rider dispatch, support |

### 1.4 What this design does not establish

- Exact service SLA, delivery fee, minimum order value, merchant liability or rider payout.
- Fixed advertised prices versus customer-approved market-price adjustment.
- Whether a single market or several markets can fulfill one order.
- Whether merchants will receive a separate app in a later phase.
- Final brand, company legal name, permitted logos or verified payment partnerships.
- Final OTP provider, payment processor, maps provider, refund policy or tax logic.

---

## 2. Brand foundations

### 2.1 Naming and voice

- **Working name:** HaatGo.
- **Working tagline:** “Your local market, delivered home.”
- **Positioning:** Familiar, trustworthy, useful and neighbourhood-first.
- **Voice:** Clear Indian English; warm, respectful, operationally honest.
- **Tone:** Prefer “Fresh from nearby markets” over exaggerated speed promises.
- **Avoid:** “Guaranteed 10 minutes,” fake scarcity, unsupported quality claims and unexplained price changes.
- **Suggested copy samples:** “Shop daily essentials”, “From markets near you”, “Partner is shopping for your order”, “Choose a substitute”, “Delivered successfully”.

### 2.2 Visual personality

Warm ivory backgrounds keep the brand approachable; emerald green expresses fresh produce and reassurance; saffron draws attention to offers, time-critical tasks and shopping actions. Photography should emphasize authentic Indian groceries and everyday market contexts, not stereotypical iconography.

### 2.3 Logo

The board uses a generic orange/green market-stall or basket mark with a HaatGo wordmark. Recreate as a clean vector asset after brand approval. Do **not** trace image-generation pixels into a production logo without review.

---

## 3. Color system

Colors are specified in hex and also available in `tokens/design-tokens.json` and `tokens/variables.css`.

### 3.1 Core palette

| Token | Hex | Typical use |
|---|---|---|
| `brand.green` | `#168B56` | Brand accent, illustration, selected decorative icons |
| `action.green` | `#0E7547` | Primary button background, interactive emphasis with white text |
| `action.greenHover` | `#0B633C` | Hover / pressed primary button |
| `brand.greenDark` | `#075B3B` | Header, admin sidebar, deep green text on light surfaces |
| `brand.saffron` | `#F6A21B` | Offers, emphasis, rider-order attention |
| `brand.saffronSoft` | `#FFF0D6` | Offer banner and promotional chips |
| `background.canvas` | `#FFF9F1` | Warm page/app background |
| `background.surface` | `#FFFFFF` | Cards, sheets, panels, forms |
| `background.subtle` | `#F3F7EE` | Selected cards, alternate panels |
| `text.primary` | `#1C312C` | Body, headings, totals |
| `text.secondary` | `#65736E` | Captions and supporting text |
| `border.default` | `#DFE7DE` | Inputs, section separators, card outlines |
| `state.error` | `#B93735` | Errors, destructive confirmation text |
| `state.success` | `#0E7547` | Success labels and icons |
| `state.warning` | `#9B5600` | Warnings and unconfirmed substitutions |
| `state.info` | `#2168BC` | Informational messages and links |

### 3.2 Accessibility rules

- For normal-size white text on colored buttons, use **action green** `#0E7547`, not brand green `#168B56`. White on the lighter brand green has approximately **4.32:1** contrast, below WCAG AA's 4.5:1 normal-text minimum. White on action green has approximately **5.75:1**.
- Use **dark text** `#1C312C` on saffron `#F6A21B`, not white; the dark-text pairing has approximately **6.62:1** contrast.
- Secondary text `#65736E` on ivory `#FFF9F1` has approximately **4.74:1**, suitable for normal text.
- Text/status should never rely on color alone. Pair with meaningful labels or iconography.
- Check every text/background combination in implementation, particularly image overlays and low-opacity statuses.

### 3.3 Semantic color patterns

| State | Background | Foreground | Label example |
|---|---|---|---|
| Available | `#E4F4EA` | `#075B3B` | “Available” |
| Shopping | `#FFF0D6` | `#9B5600` | “Shopping at market” |
| Out for delivery | `#E6F0FF` | `#2168BC` | “Out for delivery” |
| Needs attention | `#FFF0D6` | `#9B5600` | “Substitution needed” |
| Cancelled | `#FCE9E8` | `#B93735` | “Cancelled” |
| Delivered | `#E4F4EA` | `#075B3B` | “Delivered” |

---

## 4. Typography, iconography and imagery

### 4.1 Font recommendations

- **Primary UI:** Inter or a similarly legible licensed/open-source sans-serif; use consistent numeral treatment.
- **Indian scripts:** Noto Sans Bengali and Noto Sans Devanagari as locale-appropriate fallbacks.
- **Weights:** 400 regular, 500 medium, 600 semibold, 700 bold.
- **Line height:** typically 1.25 for headings; 1.45–1.55 for body.
- **Price numerals:** enable tabular numerals for receipts, bill rows, admin tables and changing timers.

### 4.2 Type ramp

| Role | Mobile | Desktop | Weight |
|---|---|---|---|
| Display / campaign | 28/34 | 40/48 | 700 |
| H1 screen heading | 24/30 | 32/40 | 700 |
| H2 section heading | 20/26 | 24/30 | 700 |
| H3 card heading | 16/22 | 18/24 | 600 |
| Body | 14/21 or 16/24 | 15/23 or 16/24 | 400 |
| Label | 13/18 | 13/18 | 600 |
| Caption | 12/17 | 12/17 | 400–500 |
| Monetary total | 22/28 | 26/32 | 700 |

Values are font size/line height in logical pixels (dp for React Native; CSS px for web), to be adjusted for OS font scaling.

### 4.3 Icons

- Use one coherent 24-pixel-outline icon family (e.g. Lucide for web and matching RN vector icons).
- Standard sizes: 16 (inline), 20 (dense controls), 24 (navigation), 32 (illustration accent).
- Labels accompany ambiguous icons: Orders, Categories, Location, Support and Earnings.
- Do not create emoji-only controls or use platform-specific emoji as essential product imagery.

### 4.4 Product imagery

- Prefer authentic, well-lit Indian market product photography with simple backgrounds.
- Keep image ratios consistent: category square 1:1, listing product square 1:1, detail hero 4:3 or 1:1.
- For weight-based items, show a representative product **plus** an explicit pack/weight label; do not imply that one tomato equals 1 kg.
- Display safe placeholder silhouettes while images load.
- Add meaningful image accessibility labels when an image conveys product identity.

---

## 5. Spacing, dimensions and elevation

### 5.1 Base spacing scale

| Token | px/dp | Use |
|---|---:|---|
| `space.1` | 4 | Micro offset |
| `space.2` | 8 | Icon-label gap |
| `space.3` | 12 | Compact row inset |
| `space.4` | 16 | Base card and screen padding |
| `space.5` | 20 | Section rhythm |
| `space.6` | 24 | Modal/group spacing |
| `space.8` | 32 | Major section separation |
| `space.10` | 40 | Desktop header grouping |
| `space.12` | 48 | Desktop section separation |

### 5.2 Radius and outline

- `radius.sm = 8` for chips and compact inputs.
- `radius.md = 12` for item cards and fields.
- `radius.lg = 18` for primary product cards, floating panels and promotional banners.
- `radius.xl = 24` for mobile bottom sheets and large banners.
- `radius.pill = 999` for badges, quantities and segmented controls.
- Standard border: 1 px `#DFE7DE`; focused controls: 2 px outline plus visible focus ring.

### 5.3 Touch and click targets

- Mobile actionable target: aim for at least **48×48 dp** (minimum accessible floor 44×44 CSS px where possible).
- Primary CTA: 48–52 dp height on mobile and 44–48 px desktop.
- Input: 48 dp mobile; OTP code boxes at least 48×48 dp.
- Bottom navigation: 56–64 dp plus safe area.
- Product list row: approx. 104–128 dp depending on photo and text.
- Quantity stepper: each minus/plus tap area at least 44×44 dp even if the icon appears smaller.

### 5.4 Elevation

- Level 0: flat surfaces with border.
- Level 1: product cards with light ambient shadow.
- Level 2: sticky checkout summary, bottom sheets, popovers.
- Level 3: dialogs, blocking confirmation.
- Avoid heavy shadows around every card; use spacing and surface contrast first.

---

## 6. Responsive layout principles

### 6.1 Mobile apps

- Target design baseline width **390 dp**, test **320, 360, 390, 412 and 430 dp**.
- Use one-column content; horizontal category scrollers may peek at the next tile.
- Product listing may use one-column rows for detailed produce information; two-column tiles for compact catalogues.
- Keep app bars compact and search prominent.
- Respect status bar, bottom gesture/navigation safe areas and keyboard avoidance.
- Primary checkout/delivery CTAs can be pinned above the bottom navigation/safe area, without covering content.

### 6.2 Customer web breakpoints

| Viewport | Layout |
|---|---|
| `< 600 px` | One column, sticky app-like bottom nav, cart as bottom sheet/page |
| `600–899 px` | Two-column grids, header search, adaptive side panels |
| `900–1279 px` | Three-column products, top navigation, right cart drawer |
| `>= 1280 px` | Four/five-column products as room allows, max content width ~1280 px |

Use breakpoints based on content fit, not device brand. Do not hide checkout functions on smaller widths.

### 6.3 Admin web

- Primary target desktop width 1440 px with left sidebar 216–240 px.
- Dense tables may horizontally scroll below 1100 px; freeze critical ID/status columns if practical.
- On tablets, sidebar collapses into navigation drawer and metric cards wrap.
- For maps: reserve 55–70% of main area; keep a clear dispatch-control panel.
- Do not force the full desktop control plane into a 390-px mobile admin layout; provide essential monitoring/read-only use first.

---

## 7. Shared component library

| Component | Variants | Critical behavior |
|---|---|---|
| AppHeader | Customer, Partner, Admin | Location/brand, contextual actions, accessible heading |
| LocationSelector | Inline, sheet, full screen | Permission rationale; manual pin/pincode fallback |
| SearchField | Idle, typing, results, empty | Clear action; keyboard submit; suggestion list |
| CategoryTile | Image, icon, text-only | Entire tile tappable; consistent asset shape |
| ProductCard | Grid, row, compact | Product name, quantity, ₹ price, availability, add CTA |
| QuantityStepper | Empty/add, 1+, max, disabled | Prevent negative/max overflow, update cart optimistically |
| PriceBlock | Standard, discount | Currency, quantity units, original price where legitimate |
| OfferBanner | Neutral, promotional | Explicit T&Cs; no unverified scarcity or discount |
| CartLineItem | Available, editing, unavailable | Inline quantity adjustment; removable with feedback |
| BillSummary | Collapsed, expanded | Items, handling/delivery, discount, taxes if applicable, total |
| AddressCard | Saved, selected, editable | Home/work/other label, phone and instructions |
| PaymentSelector | UPI, COD, other provider | Selected state, unavailable reason, retry path |
| OrderStatusStepper | Shopping, delivering, complete | Timestamps, meaningful descriptions, live updates |
| RiderAssignmentCard | Pending, assigned, accepted | ETA, partner details only when permissioned |
| ShoppingChecklistItem | Open, picked, unavailable, substituted | Quantity, original and actual cost, audit action |
| SubstituteApproval | Pending, approved, rejected | Prevent purchase without approval where required |
| BottomSheet | Cart, address, substitution | Drag handle, accessible title, escape/back behavior |
| Alert/Toast | Success, info, warning, error | Non-blocking unless user decision is required |
| DataTable | Normal, filtered, bulk actions | Sorting, pagination, row actions, export controls |
| EmptyState | Cart, search, orders, riders | Context-specific recovery CTA |
| Skeleton | Listing, details, dashboard | Avoid jumping layout; announce loaded state |

### 7.1 Button states

Every actionable button needs **default, hover (web), pressed, focus-visible (web), loading, disabled**, and applicable success state. Show an inline spinner alongside short text (“Placing order…”) and prevent duplicate submissions.

### 7.2 Error states

Provide actionable validation: “Enter a valid 10-digit mobile number,” “We don't deliver to this address yet,” “Payment wasn't completed; try again,” “Price changed—review your cart.” Avoid generic “Something went wrong” without recovery.

### 7.3 Product representation

A product card should include `productId`, localized name, image, display unit (1 kg/500 g/12 pcs), integer price in **paise** at data layer, availability state, a prominent Add or stepper control, and legally accurate discount information when displayed. Support variable-weight products without pretending units are identical.

---

## 8. Screen inventory and detailed UX

All referenced artwork is contained under `images/`. Screen numbers refer to the order of mockups within each contact sheet.

### 8.1 Customer mobile — discovery (8 frames)

**Image:** `01_customer_mobile_discovery.png`

| # | Screen | Required elements | Primary CTA/behavior |
|---:|---|---|---|
| 1 | Splash / welcome | Brand, concise market-first value, trust cues | Get Started |
| 2 | Mobile number / OTP | Country code +91, phone entry, OTP, resend timer, consent | Send OTP / Verify |
| 3 | Choose location | Permission request explanation, map pin, manual address/pincode | Confirm Location |
| 4 | Home | Serviceable location, ETA estimate, search, categories, local offers, product shelves | Browse/Add products |
| 5 | Categories | Visual category tiles; vegetables, fruits, fish, staples, dairy, eggs | Open category |
| 6 | Product listing | Category title, sort/filter chips, product rows, price/unit, Add | Add to cart |
| 7 | Search | Suggestions, recent searches, matching results, clear/reset | Open item / Add |
| 8 | Product detail | Hero photo, detailed name, size, unit price, availability, quantity stepper | Add to Cart |

**UX notes**

- Location must gate delivery availability but must not block the user from manually entering a pincode if GPS is denied.
- An unavailable product has explicit text, not a silently missing Add button.
- If the market is closed or riders are unavailable, show delivery availability before checkout.
- Search should tolerate common spellings: `alu/aloo`, `peyaj/pyaaz`, `dhaniya/coriander`.

### 8.2 Customer mobile — purchase, tracking and account (8 frames)

**Image:** `02_customer_mobile_checkout.png`

| # | Screen | Required elements | Primary CTA/behavior |
|---:|---|---|---|
| 1 | Cart | Items, quantities, fees, discount, estimated total | Proceed to Checkout |
| 2 | Saved addresses | Radio selection, add/edit, house labels | Choose address |
| 3 | Add address | Map pin, flat/building, landmark, city, pincode, instructions | Save Address |
| 4 | Checkout | Address, slot/ETA, order summary, all fees | Choose payment |
| 5 | Payment methods | UPI, COD, card only when actually supported; secure processing | Pay / Place order |
| 6 | Order confirmed | Order ID, current next step, ETA estimate, support | Track Order |
| 7 | Live order tracking | Market/shopping stage, partner info, map (if available), delivery stage | View progress / Contact support |
| 8 | Orders / Profile / Help | Orders and reorder entry, account, addresses, support | View order / Support |

**Implement as separate routes even when presented on a combined concept frame:** `orders`, `order-detail`, `profile`, `help`, `refund-detail`. These are not separate finished renders in this board.

**UX notes**

- Lock the order's reviewed price and fees at confirmation, unless a clearly approved variable-price mechanism exists.
- If the rider requests a substitute, customer gets a decision screen with old/new item, quantity, price difference and a deadline.
- Any payment timeout, failed UPI return or order submission retry must be idempotent server-side.
- Keep tracking useful even without location-sharing: status milestones and timestamps must remain available.
- Cancellation/refund links must follow the eventual policy and real payment status.

### 8.3 Delivery-partner mobile (10 frames)

**Image:** `03_delivery_partner_mobile.png`

| # | Screen | Required elements | Primary action |
|---:|---|---|---|
| 1 | Login / OTP | Phone verification, role confirmation | Verify |
| 2 | Partner home | Online/offline, active task, today’s earnings/orders | Go Online |
| 3 | Incoming order | Market + customer broad area, ETA, compensation, accept timer | Accept / Decline |
| 4 | Go to market | Market address, route preview, call/navigate | Navigate to Market |
| 5 | Shopping checklist | Items, quantity, target price, picked/missing controls | Mark Shopping Complete |
| 6 | Unavailable item | Missing item, eligible substitute, customer approval status | Send Approval Request |
| 7 | Purchase confirmation | Actual quantities, actual total, bill/receipt image | Confirm Purchase |
| 8 | Deliver to customer | Customer location, route, ETA, delivery instructions | Navigate to Customer |
| 9 | Delivery OTP | OTP input, accessibility fallback, confirmation summary | Complete Delivery |
| 10 | Earnings / history | Completed jobs, payouts, order history, partner info | Inspect payout |

**UX notes**

- Use a clear three-step header: **Reach market → Shop items → Deliver**.
- Partner must not mark an unavailable item as bought.
- Show approval as `Pending / Approved / Declined / Timed out`.
- Don't expose a customer's phone or exact address before dispatch eligibility allows it.
- For offline/network loss, locally retain the shopping checklist and unsent progress, then reconcile with server on reconnect.
- The partner-facing order offer timer and distance-search radius are operational rules, not fixed design tokens.
- Earnings on screenshot are fictional and do not establish rider compensation.

### 8.4 Customer responsive website (8 frames)

**Image:** `04_customer_web.png`

| # | Screen | Core content | Responsive behavior |
|---:|---|---|---|
| 1 | Home | Location, search, local produce hero, featured items | Mobile-first stacked cards |
| 2 | Categories | Category cards and navigation | 2 columns mobile; expanding grid desktop |
| 3 | Product listing | Chips, product cards, availability | 1–2 mobile columns; 3–5 desktop |
| 4 | Search & filter | Query, sort, filters, results | Filters become mobile bottom sheet |
| 5 | Product detail | Image, attributes, price, quantity, description | Image/content stack on mobile |
| 6 | Cart | Line items, fee breakdown, total | Full mobile cart page or accessible sheet |
| 7 | Checkout | Address, payment, summary, order CTA | Single column on mobile |
| 8 | Order / account | Live status, order history, account navigation | Status card first on mobile |

**Web behavior**

- Customer authentication, cart and order status must stay consistent with mobile app when the same account is used.
- Mobile web retains a discoverable cart total and checkout route.
- Use semantic HTML, keyboard focus and accessible dialog behavior.
- Sticky header must never obscure anchor targets or checkout controls.

### 8.5 Admin web (10 frames)

**Image:** `05_admin_web.png`

| # | Screen | Main content | Critical operations |
|---:|---|---|---|
| 1 | Overview dashboard | Orders, revenue, cancellations, trends, filters | Drill down by date/market |
| 2 | Live orders | Filterable order list and status chips | Open / assign / escalate |
| 3 | Order detail | Customer, items, timeline, partner, costs | Resolve exception with audit trail |
| 4 | Dispatch map | Market/rider map, available partner list | Auto/manual assign |
| 5 | Catalogue | Product name, category, unit, list price, stock flag | Create/edit/archive products |
| 6 | Categories & promotions | Category order, banners, offers | Publish with validity rules |
| 7 | Markets & zones | Market list, polygon/radius, delivery fee, hours | Enable/pause delivery zone |
| 8 | Delivery partners | Verification, status, role, delivery metrics | Approve/suspend/assign |
| 9 | Customers & support | Customer records, issues, disputes | Open ticket / act / log outcome |
| 10 | Payments & analytics | Collections, refunds, reconciliations, configuration | Export / reconcile / review |

**Admin behavior**

- Operations pages need role-based access: super-admin, catalogue, dispatch, support, finance.
- Treat actions such as refund, cancellation, suspension and delivery override as auditable state transitions.
- Use `₹`, Indian number grouping where helpful, local date/time zone, and timestamp detail in row views.
- Never expose entire payment credentials or excessive personal information in broad tables.
- Use confirmation modal plus reason for irreversible state changes.

---

## 9. Navigation and information architecture

### 9.1 Customer navigation

- Bottom tabs (mobile): **Home, Categories, Search, Orders, Account**.
- Cart is accessible in header or sticky checkout summary; do not depend on a sixth tab.
- Home → Category/Search → Product → Cart → Address → Payment → Confirmation → Tracking.
- Tracking remains accessible from Orders even after app restart.

### 9.2 Partner navigation

- Tabs: **Home, Orders, Earnings, Profile**.
- Active task flow is a high-priority guided route and should not be lost on tab switch.
- Customer substitution requests should open a full-screen decision sheet or dedicated action card.

### 9.3 Admin navigation

- Sidebar: Overview, Orders, Products, Categories, Markets, Partners, Customers, Payments, Analytics, Settings.
- Support can live within Customers in a low-budget MVP, but should have dedicated route and ticket status.
- Expose cross-links from every order to the related customer, rider and market.

---

## 10. Operational status and event model

### 10.1 Suggested order states

```text
draft
  → placed
  → assignment_pending
  → partner_assigned
  → partner_accepted
  → traveling_to_market
  → shopping
  → shopping_review (only if change needs approval)
  → purchased
  → out_for_delivery
  → delivered
```

Exception paths: `assignment_failed`, `customer_cancelled`, `merchant_unavailable`, `payment_failed`, `delivery_failed`, `refund_pending`, `refunded`.

These are design-level proposed states, not an already approved backend schema. The server must own transition validation. The UI should consume a server-provided status, never infer final state from a timer.

### 10.2 Event-to-screen mapping

| Event | Customer UI | Partner UI | Admin UI |
|---|---|---|---|
| Order placed | Confirmation | No assignment yet | New order |
| Offer sent | “Finding partner” | Countdown accept card | Pending offer |
| Partner accepted | Partner + stage visible | Market navigation | Assigned |
| Shopping started | “Shopping at market” | Checklist | Shopping |
| Item missing | Approval card / notification | Substitute request | Exception flag |
| Shopping complete | “Preparing delivery” | Receipt/purchase review | Actual items recorded |
| On the way | Map/status, ETA | Customer navigation | Dispatch map |
| Delivered | Receipt/order history | Earnings + completion | Delivered + reconciliation |

### 10.3 Notifications

- Push: order accepted, substitution approval required, out for delivery, delivered, issue/refund.
- In-app: persistent status updates and action-required banners.
- SMS fallback only if commercial policy and budget allow it.
- Throttle repetitive movement updates; notify on meaningful milestones.

---

## 11. Forms, currency, units and Indian localization

### 11.1 India defaults

- Mobile prefix: `+91`; accept 10-digit Indian mobile number after prefix.
- Currency: INR with `₹`. Represent money as integer paise in backend/API.
- Sample units: `250 g`, `500 g`, `1 kg`, `1 L`, `6 pcs`, `12 pcs`, `1 bunch`.
- Sample address: house/flat, building, street, landmark, area, city, state, six-digit PIN code.
- Use `Asia/Kolkata` for customer-facing local timestamps; retain UTC in backend persistence.
- Locale options for future release: English, Bengali, Hindi; never mix untranslated strings inside one product screen by accident.
- Payment labels: “UPI,” “Cash on Delivery,” and any card/netbanking method actually enabled.

### 11.2 Currency examples

- Product: `₹28 / 1 kg`.
- Item subtotal: `₹108`.
- Delivery fee: `₹29`.
- Discount: `−₹20`.
- Total to pay: `₹117`.
- Keep fees explicit and calculate totals server-side. Never rely on visually generated math in the boards.

### 11.3 Content patterns

| Situation | Prefer | Avoid |
|---|---|---|
| Location unavailable | “Enter your pincode to check delivery” | “GPS failed” |
| Item unavailable | “Tomato is unavailable right now” | “Error 409” |
| Price review | “Review new total before confirming” | “Price updated automatically” |
| Rider shopping | “Your partner is buying items at the market” | “Packed in warehouse” |
| Delivery estimate | “Estimated 30–45 min” only if supported | “Guaranteed 10 min” |
| Payment retry | “Payment didn't go through. Try again.” | “Transaction error” |

---

## 12. Accessibility, privacy and inclusive UX

### 12.1 Accessibility checklist

- Aim for WCAG 2.2 AA on web and equivalent accessible mobile patterns.
- Support Android font scaling / dynamic text; never clip amounts or critical CTA labels.
- Touch targets ≥48 dp mobile; keyboard-operable controls on web.
- Provide visible keyboard focus, descriptive field labels and screen-reader announcements for live order updates.
- OTP must support autofill, paste, resend, expiry and errors; do not rely solely on six separate tiny inputs.
- Maps require a text-based destination, order progress and route alternative.
- Motion should respect reduced-motion preferences; avoid indefinite pulsing warnings.
- Use clear order stages and icons in addition to green/orange status colors.
- Confirm with assistive technologies for checkout, bottom sheets and rider completion.

### 12.2 Privacy and safety

- Show phone/address details to riders only when needed for an accepted delivery.
- Do not include full bank details or card data in client-side logs/analytics.
- Protect profile photos, location histories and contact numbers with role-appropriate access.
- Provide proof-of-delivery controls that minimize unnecessary customer exposure.
- Ask for foreground location with contextual explanation; background location only if operationally required and policy-compliant.

---

## 13. Motion and interaction patterns

| Interaction | Suggested response |
|---|---|
| Add to cart | 150–220 ms visual confirmation; cart count updates |
| Change quantity | Optimistic button state; revert clearly if server rejects |
| Open product details | 180–250 ms transition, preserve scroll context |
| Open filter/address sheet | 220–300 ms ease-out |
| Order submitted | Disable duplicate submit and show progress |
| Partner offer countdown | Text timer + status; do not communicate by color only |
| Purchase confirmation | Explicit receipt upload state and success feedback |
| Live tracking | Update stage on event; avoid jumpy map recentering |
| Errors | Inline message adjacent to affected control and retry |

Prefer a calm visual language. Animations should clarify state rather than artificially imply speed.

---

## 14. Technical design-to-code guidance

### 14.1 Suggested component boundaries

```text
03_Projects/
  haatgo-customer-android/           # independent repository
    screens/{auth,home,search,product,cart,checkout,orders,account}
  haatgo-driver-android/             # independent repository
    screens/{auth,home,assignment,shopping,delivery,earnings}
  haatgo-customer-web/               # independent repository
    routes/{home,categories,product,cart,checkout,orders,account}
  haatgo-admin-web/                  # independent repository
    routes/{overview,orders,dispatch,products,markets,partners,support,finance}
```

Updated 15 November 2026: each project owns its components, theme adapter, utilities,
dependencies and lockfile. Backend is the fifth independent repo, `haatgo-backend`.
Design tokens are plain local copies; no common code packages, sibling imports or
shared node_modules. See the workspace repository architecture and execution lists.

### 14.2 Theming

- Use the token files as the initial source of truth; map semantic styles to React Native `StyleSheet`/theme objects and CSS variables.
- Avoid hardcoding colors/sizes in screen components.
- Component contracts should be explicit: `ProductCard({product, unit, price, availability, onAdd})`, `OrderStepper({state, timestamps})`.
- Implement TypeScript currency and quantity/weight formatters independently in each repo; verify matching output against the same documented examples.
- Use localization keys from the beginning for reusable UI strings.

### 14.3 Data and offline UX

- Generate all displayed totals from authoritative backend responses.
- Checkout/order endpoints need request idempotency keys.
- Cache product images/data where appropriate but revalidate price and serviceability before checkout.
- Reconnect partner checklist updates safely after intermittent signal; prevent duplicated purchases/order transitions.
- Route location and rider status are not a substitute for actual server state.

---

## 15. Implementation QA / definition of done

### Customer

- [ ] Login, location selection, catalogue, search, product details all work at 360 dp and 390 dp.
- [ ] Product shows correct unit, availability, pricing and quantity change.
- [ ] Cart recalculates with server-confirmed fees and discounts.
- [ ] Address entry supports manual pin/landmark entry.
- [ ] Payment paths include success, failure, pending and retry states.
- [ ] Confirmation persists order ID and can reopen tracking after restart.
- [ ] Shopping/substitution/delivery milestones show real backend status.
- [ ] User has access to order history, support and cancellation policy.

### Delivery partner

- [ ] Rider can toggle availability and receive an assignable request.
- [ ] Accepted job retains context across navigation/app restart.
- [ ] All products and requested quantities are visible in market checklist.
- [ ] Missing items cannot silently be marked fulfilled.
- [ ] Price change/substitution requires the defined approval process.
- [ ] Receipt confirmation validates required data.
- [ ] Delivery OTP and failure fallback are tested.
- [ ] Earnings reflect backend settlement, not mock totals.

### Website and admin

- [ ] Customer mobile web can complete checkout without horizontal overflow.
- [ ] Desktop storefront has responsive product grids and usable filters.
- [ ] Admin roles are enforced on server and UI; sensitive actions audited.
- [ ] Dispatch map has equivalent usable list/detail mode.
- [ ] Every table supports empty/loading/error states.
- [ ] All pages pass basic keyboard navigation and contrast checks.
- [ ] Product, rider and order changes are visible consistently across clients.

---

## 16. Decisions to finalize before building

These are deliberately flagged because visual mockups alone cannot define business logic:

1. **Catalogue model:** fixed selling prices (recommended initial direction), dynamic market receipt pricing, or shop-managed listings?
2. **Fulfillment:** does one delivery partner shop and deliver every order, or can the job split?
3. **Market selection:** primary market assigned by geofence, category, or fallback priority?
4. **Out-of-stock:** substitutions permitted? Is explicit customer approval always mandatory?
5. **Payments:** COD only at launch, or UPI/Razorpay too? When is payment captured?
6. **Refunds:** what triggers partial/full refund and who approves it?
7. **SLA:** service radius, opening hours, realistic ETA calculation, operating zones.
8. **Fees:** delivery charge, handling, surge, minimum value, coupon validity.
9. **Rider settlement:** per-order fee, reimbursement for items purchased, cash handling.
10. **Brand:** final name, trademark/domain clearance, approved wordmark and product photography.

The current screen boards are a strong visual starting point. Once these decisions are resolved, turn this design document into a final PRD, wireflow and screen-level Figma/React Native component specification.

---

## 17. Asset credits / provenance

Five images in this kit were generated as original visual design concept boards for this request on 14 November 2026. They are **reference images**, not production assets or verified screenshots of an operating HaatGo service. Any apparent third-party brand mark or product packaging in the concept boards should be replaced with permitted assets before release.

