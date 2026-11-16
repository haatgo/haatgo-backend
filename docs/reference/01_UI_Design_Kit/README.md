# HaatGo — UI design handoff

**Version:** 1.0 visual concept · **Date:** 14 November 2026  
**Project:** Indian local-market shopping and delivery platform  
**Coverage:** Customer mobile app, delivery-partner mobile app, responsive customer website, and web admin.

## Contents

| Path | Contents | Concept frames |
|---|---|---:|
| `images/01_customer_mobile_discovery.png` | Splash, OTP, location, home, categories, listing, search, product detail | 8 |
| `images/02_customer_mobile_checkout.png` | Cart, addresses, checkout, payment, confirmation, tracking, orders/profile/support | 8 |
| `images/03_delivery_partner_mobile.png` | Rider login, availability, offers, shopping, substitutions, receipt, delivery, earnings | 10 |
| `images/04_customer_web.png` | Responsive customer website from discovery through order tracking | 8 |
| `images/05_admin_web.png` | Admin overview, orders, dispatch, catalogue, markets, riders, support, finance | 10 |
| `DESIGN_SYSTEM.md` | Detailed styles, UI anatomy, workflows, UX and accessibility specifications | — |
| `tokens/design-tokens.json` | Machine-readable foundational tokens | — |
| `tokens/variables.css` | Starter CSS custom properties | — |

**Total: 44 conceptual screen frames across five original design boards.**

## How to use this handoff

1. Open the five PNG boards to review the visual direction.
2. Treat `DESIGN_SYSTEM.md` as the source of truth for tokens and intended behavior.
3. Build actual interactive screens using native components; do not ship slices of the concept images as an interface.
4. Create dedicated detailed states (loading, empty, error, cancellation, refunds) not depicted in every board.
5. Confirm the open product decisions listed under "Decisions to finalize" before accepting implementation scope.

## Status and caveats

- **HaatGo** is a temporary design-concept name, not a verified or approved brand or domain.
- All illustrations, products, personas, prices, area pins, dates, order IDs, receipts, statistics, travel routes, promotional claims and ETAs in the boards are **illustrative only**.
- Generated board text may contain inconsistencies; implementation copy should come from the screen matrix and content guidance in the design-system document.
- These PNGs are **flattened presentation contact sheets**, not layered Figma source files or individual editable screen exports.
- This kit supports the earlier approximately ₹85,000 local-market MVP concept, not the unrelated ₹2,00,000 React Native project previously discussed.

