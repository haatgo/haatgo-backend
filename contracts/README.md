# haatgo-backend

Independent HaatGo repository scaffold. **Product implementation has not started.**

Start with [granular execution tasks](docs/EXECUTION_LIST.md), [architecture](docs/REPOSITORY_ARCHITECTURE.md), and [TAD_05_BACKEND.md](docs/reference/02_PRD_And_TADs/TAD_05_BACKEND.md).
All PRD/TAD/design references are committed local copies under docs/reference.

Own .git, environment, source tree and CI. Bootstrap task `BE-BOOT` creates the real package manifest, pinned dependencies, lockfile and build/native project. No dependencies are installed yet.

```powershell
python scripts/verify_repository.py
```

This command verifies snapshots/isolation only. Application build, lint, typecheck and device/browser commands will be added and verified during bootstrap.

Contracts: edit canonical contracts/*.json here.
Generated enum/envelope declarations: src/generated/backend-contract.ts. These are a draft baseline, not full endpoint DTOs.

No sibling repository is required to read/build/test a completed standalone checkout. The surrounding local coordinator is optional developer tooling only.

Runtime URL examples in .env.example require a future configuration loader and HTTPS release setup; there is no running app here yet.

API inventory is extracted from TAD 05. Full OpenAPI and runtime validators are BE-OPENAPI/BE-EVENTS work. Version 0.1.0 is a draft, with unresolved vocabulary recorded in domain-contract.json.
