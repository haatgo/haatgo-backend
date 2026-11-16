# haatgo-backend implementation rules

Read docs/REPOSITORY_ARCHITECTURE.md, docs/EXECUTION_LIST.md and docs/reference/02_PRD_And_TADs/TAD_05_BACKEND.md.

This is an independent repo. Own source, node_modules, lockfile, build and release.
No imports/config dependencies from parent or sibling projects; no file:/workspace:/link: dependencies.
Only contract/token/reference snapshots may propagate from the local coordinator.
Implement business logic in TypeScript. Native Android platform glue is allowed.
Mobile uses bare RN + Paper, never Expo; web uses React/Vite + shadcn/Tailwind.
Client state/async stack is Redux Toolkit/Persist/Saga/Axios.
Backend owns monetary truth, permission and transitions. Reconnect must fetch current state.
Read the qualified DECISION_LOG decisions before implementing unresolved policies.
Update docs/tasks.json statuses with evidence and render the execution list.
Verify this repo using python scripts/verify_repository.py. Complete product checks after bootstrap.
Do not mark synchronized contracts as tested behavior; review and attach evidence for release.
