# Independent repositories and local integration

**Baseline: 15 November 2026.** This replaces the older monorepo/shared-package
recommendations in the initial handoff. Five repositories, one backend service.
The original scaffolds now contain running local applications and test suites.
See IMPLEMENTATION_PROGRESS.md and RUN_LOCAL.md in the surrounding workspace for
verified behavior and startup. Production acceptance remains pending.

| Repository | Owns | Stack | Local address proposal |
|---|---|---|---|
| haatgo-backend | API, workers, database migrations, backend contracts | Express/TypeScript, MongoDB, Redis, BullMQ, Socket.IO | API :4000 |
| haatgo-admin-web | Operations, dispatch, catalogue, finance, support | React/Vite, shadcn/ui, Tailwind, Redux Toolkit/Persist/Saga, Axios | :5174 |
| haatgo-customer-web | Responsive storefront and customer account | React/Vite, shadcn/ui, Tailwind, Redux Toolkit/Persist/Saga, Axios | :5173 |
| haatgo-customer-android | Customer Android app and native project | Bare React Native, Paper MD3, Redux Toolkit/Persist/Saga, Axios | Metro :8081 |
| haatgo-driver-android | Partner shops at market and delivers | Bare React Native, Paper MD3, Redux Toolkit/Persist/Saga, Axios | Metro :8082 |

## Repository independence

Every code repository has its own `.git`, `.gitignore`, docs, task data, environment
example, contract snapshots, design copies, and standalone verification workflow.
The five code repositories are private under the GitHub organization `haatgo`. This
separate documentation repository holds the coordination materials and local
integration tooling; it is not an npm workspace and contains no application source.

Each app is bootstrapped **inside its own repo**, with pinned compatible versions,
its own package.json/package-lock.json and installed node_modules. Native Android
debug APKs have built and real browser/device journeys have been exercised. Clean
isolated-checkout release acceptance is still a separate gate.
Do not use parent postinstall scripts or require Python sync in an application's build.

No sibling source imports, common component folders, shared money utilities, shared
Redux store, symlinked node_modules, npm link, workspace dependencies, parent tsconfig,
or shared application code. Similar components, formatters, theme adapters and stores
are implemented independently and verified against the same behavior fixtures.
The `shared/` directory mentioned in individual TADs means internal to that repo only.

The backend API and worker remain in the **same backend repo** and can reuse backend
modules within that repo. They run as separate processes; no extra microservice repo
is required. MongoDB and Redis are backend infrastructure, never frontend dependencies.

## Authority and copied artifacts

| Artifact | Authoritative owner | How others consume it |
|---|---|---|
| PRD / TAD / traceability / decision log | 02_PRD_And_TADs | Repository-local reference copies |
| UI boards / tokens / design spec | 01_UI_Design_Kit | Repository-local reference and token copies |
| API inventory / domain enums / events | haatgo-backend/contracts | Versioned copies in each client's contracts/backend |
| OpenAPI / event schemas / examples | Backend contracts | Owned allowlisted JSON copies; full response examples remain pending |
| App UI, state, HTTP adapter, validation | Each individual client | Never imported or copied from another repo |
| Source change identity | Backend src and worker hash | Revision marker in every repo; no backend code copied |

Plain snapshots and generated enum/envelope declarations are owned copies, not linked
runtime packages. The app imports its **own** generated file. If a repo is moved out
of this workspace, all committed snapshots remain available. Python 3.10+ is needed
only for tooling; install nothing at the workspace root. The supplied checks require
Python 3.12+ for the Windows link/junction audit (Path.is_junction).

`api-inventory.json` now lists 91 implemented local API operations. `openapi.json`
documents those operations and core entity/request schemas, while detailed response
schemas remain incomplete for some operations. `domain-contract.json` records actual
guarded transitions and local policy decisions. Event schemas and owned enum/envelope
declarations propagate alongside them. These are development contracts, with full
production schema and compatibility acceptance still pending.

## Two different kinds of synchronization

1. **Development contract synchronization:** run the local watcher. Backend contract,
   source, or reference changes update owned snapshots. CI checks hashes and pending
   reviews. Changed contracts require app code changes and tests as appropriate.
2. **Runtime data synchronization:** implement the same authoritative backend APIs
   in all clients, invalidate/refetch on domain events, refresh on reconnect/focus,
   compare sequence/version, and reconcile customer cart revisions. This is product
   work in the execution lists; the local file watcher cannot implement it.

Changing a backend price rule must not duplicate that rule in a client. Clients
render the server's quote. Changing an API field requires contract revision plus
consumer updates. Internal backend refactoring still updates its source hash and
requires a recorded impact review; unaffected clients can document why no change
is needed, with their compatibility checks attached.

## Compatibility and release ordering

Mobile binaries already on devices cannot be updated by changing backend source.
Prefer additive optional fields and safe unknown-state rendering. Retain old response
shapes/enum handling for at least two app releases as proposed in TAD 05, or introduce
an explicit /v2. Adding an enum value may break an exhaustive client switch and must
be reviewed. An inventory version bump alone does not prove compatibility.

Order: agree decision -> update backend contracts and compatibility examples -> sync
locally -> update all affected repos -> run provider and consumer tests -> record
integration evidence -> deploy backward-compatible backend -> publish clients ->
observe adoption -> remove old behavior only through an approved versioned change.
Each repo keeps its own release/version/rollback artifact. No atomic multi-repo
deployment is implied. Use `CROSS_REPO_CHANGE_TEMPLATE.md` in the local execution pack.

## Runtime propagation acceptance

| Trigger | Backend responsibility | Client response / cross-repo evidence |
|---|---|---|
| Admin changes price or product | Mongo version update, audit, outbox, cache invalidation | Customer app/web refetch; old quote rejected with replacement; driver accepted-order snapshot stays stable |
| Admin closes market/zone | Authoritative serviceability and effective policy | New checkout blocked on both customer surfaces; active assignments governed by policy |
| Cart edited on web or Android | One customer cart with revision-conflict handling | Other customer surface refetches on focus/reconnect; conflict never silently overwrites |
| Partner accepts/changes stage | Atomic claim, version + sequence, outbox | Both customer surfaces and admin show same order stage; other partner cannot claim |
| Customer decides substitute | Versioned proposal decision transaction | Driver checklist and admin detail refetch; no purchase before approval |
| Receipt/delivery OTP confirmed | Private evidence, exactly-once domain effects | Customer history, admin timeline, driver earnings reflect committed state |
| Refund/COD/reimbursement changes | Separate idempotent ledger dimensions | Authorized screens show authoritative amounts and pending/terminal states |
| Socket gap/duplicate/reorder | Persist facts; authorize rooms; GET snapshot | Clients ignore stale versions; GET on reconnect, foreground and unknown events |

Catalogue/cart events invalidate snapshots; clients also revalidate on focus and
foreground polling. Full duplicate/reorder and latency acceptance remains pending.
Pilot target: >=95% meaningful order updates within 15s while online; measure it.

## Decision boundaries

Use `DECISION_LOG.md DEC-xx` as canonical operational decision IDs. PRD section 16
uses a different DEC list; always qualify references. Fixed prices, one-market/one-
partner, COD funding, substitutions, refund limits, vendors, final brand/app IDs,
support and release dates remain proposals pending recorded decisions. Conditional
online payments and P1 features cannot silently become launch commitments.

## Catalogue asset storage

Catalogue product images, category icons and section artwork use real Cloudinary
uploads by explicit user request. The backend alone holds the existing upload
preset configuration. All uploaded assets use the dedicated haatgo folder tree.
Public URL manifests and owned vector fallbacks are ordinary asset/config copies;
no application logic or dependency directory is shared. Private purchase receipts
remain in their separate authorized storage flow. OTP/payment/push stay dummy.
