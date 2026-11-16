# haatgo-backend

Independent HaatGo repository with its own source, lockfile, dependency directory,
environment, Git root, contracts and tests. No sibling code or parent npm package
is needed. This is a local dummy-provider implementation; release acceptance is
still pending in [the execution list](docs/EXECUTION_LIST.md).

See [implementation evidence](docs/IMPLEMENTATION_EVIDENCE.md),
[architecture](docs/REPOSITORY_ARCHITECTURE.md) and `docs/reference` for the copied
PRD, TAD, design boards and tokens. The surrounding workspace coordinator is
optional tooling and is never imported by this application.

## Install and run

Use Node 22.13 or newer compatible with the pinned dependencies. Run commands in
this repository only. Copy `.env.example` to `.env`, then install with `npm ci`.
The checked-in examples contain public demo values, not live provider credentials.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev:local
```

API: http://localhost:4000. The local launcher downloads a real MongoDB binary,
starts a persistent single-node replica set on port 27027 under `.runtime/mongo`,
and watches the API source. It does not use an existing MongoDB on port 27017.
For your own replica set, configure MONGODB_URI and use `npm run dev`.

Default QUEUE_MODE=dummy runs bounded local processing explicitly. To exercise
the selectable Redis/BullMQ path, configure a private Redis URL and namespace,
set QUEUE_MODE=redis, run the API, then `npm run worker` in a separate terminal.
Real Redis outage/recovery has not been verified on this host.

## Checks and contracts

```powershell
npm run typecheck
npm run test:integration
npm run test:e2e
npm run build
npm run test:smoke
npm run contracts:generate
python scripts/verify_repository.py
```

Smoke requires the running API. E2E starts temporary real MongoDB replica sets;
it does not erase local development data. The contract generator owns plain API,
domain and event JSON. Full operation response schemas are still pending.

## Local recovery

```powershell
npm run db:backup -- .runtime/backup-2026-11-15.json
npm run db:restore -- .runtime/backup-2026-11-15.json "mongodb://127.0.0.1:27027/haatgo_restore_drill?replicaSet=rs0" .runtime/restore-drill-receipts
```

Backup takes one consistent database snapshot and includes uploaded private images
with SHA-256 integrity checks. It refuses to overwrite a backup file. Restore
requires an explicit fresh target database and receipt directory, validates before
writing, never deletes existing records and revokes restored sessions/devices.
To serve a restored database, place its restored image files in the API process's
`.runtime/private-receipts` directory before startup. The drill directory remains
separate for inspection. Backup JSON contains private data: keep it outside Git.
Off-host encryption/retention and production recovery objectives remain unverified.

## Demo access

Customer/partner OTP: **123456**. Delivery OTP: **654321**.
Admin: **admin@haatgo.local** / **HaatGo-demo-2026!**.
Sample PINs: **700150, 700149, 700151**. No SMS or real payment is sent.
Production startup deliberately refuses dummy credentials/adapters.


## Catalogue images

Admin product/category Add and Edit forms support public Cloudinary image uploads,
preview, replacement and removal. Select PNG/JPEG/WebP up to 2 MB; wait for upload
before saving. The backend normalizes images, selects the dedicated haatgo folder,
checks catalogue permission and audits the managed asset. Cloudinary configuration
lives only in ignored backend environment files. MEDIA_PROVIDER=cloudinary enables
this real media adapter independently of dummy OTP/payment providers. Configure
CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET and CLOUDINARY_ASSET_ROOT=haatgo.
No secret or upload preset belongs in a VITE variable. Seeded public URL manifests
allow independent checkouts to display the asset library without sibling files.
Image associations can be replaced/removed; historical Cloudinary assets are retained.

Backend Vitest sets MEDIA_PROVIDER=disabled and clears Cloudinary configuration;
provider payload tests use an injected/mocked transport. Browser upload E2E is an
explicit live-provider check against the running configured development API.
