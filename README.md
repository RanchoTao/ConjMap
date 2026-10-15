# ConjMap

**Mapping the Frontiers of Mathematics.** An open, interactive, evidence-traceable research map. V0.1 is a working local Next.js application, not a proof engine.

## Run locally

Requires Node.js 24 LTS and npm (tested locally on Node 25.2.1; CI targets 24). From a fresh checkout:

```sh
npm run dev
```

The launcher runs `npm ci` if dependencies are absent, then opens a server at **http://127.0.0.1:3000**. Initial dependency installation requires internet; subsequent browsing uses bundled data and local assets, without keys, databases, cloud accounts, or remote fonts. No `.env` file is necessary. Stop with Ctrl+C.

For a production-mode local check:

```sh
npm ci
npm run check
npm start
```

## What ships

- Home, interactive Cytoscape atlas, searchable/sortable/paginated problem index, evidence-rich problem detail, sources, and about pages.
- Responsive layouts and persisted dark/light themes. An accessible node index provides a keyboard alternative to the canvas.
- **120 source statements, 6 fields, 82 unverified discovery associations.** All independent mathematical statuses are **unknown**. Source-reported `research open` is displayed separately. **0 independently verified problems, 0 real research runs.**
- Deterministic Python source adapter; canonical IDs, aliases, source mappings, pinned upstream files, Apache license and SHA-256 manifest.
- Versioned Research Task API with a durable local **mock** journal. Failed routes and candidate placeholders remain mock/unverified and cannot change problem status.

| Field | Statements |
| --- | ---: |
| Algebra | 10 |
| Analysis | 16 |
| Combinatorics | 31 |
| Geometry & topology | 23 |
| Logic & foundations | 10 |
| Number theory | 30 |

All 120 imports come from **The Formal Conjectures Authors**, `google-deepmind/formal-conjectures`, Apache-2.0, revision `2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6`. No whole-site scraping was used. References to other websites remain links, not redistributed copies. Source labels may be stale; imports have not been independently reviewed or checked in Lean. Some selected statements are open variants of famous solved problems; the theorem signature and original file heading are retained.

## Checks

```sh
npm run validate:data
npm run lint
npm run typecheck
npm test
python -m unittest discover -s adapters -p "test_*.py"
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run check` runs data validation, lint, typecheck, unit tests and build. Playwright starts its own production server on port 3100, tests browser interactions and API boundaries, and writes screenshots to `docs/screenshots/`. CI runs these checks and uploads reports. A successful local run is not evidence that remote CI has passed: see the PR and [acceptance report](docs/acceptance-report.md) for executed results.

## Minimal end-to-end acceptance

1. Run `npm run dev`. Open `/atlas`; pan, zoom, select a node, and follow “Read problem & evidence”. Alternatively use the keyboard-accessible node index.
2. Search `riemannHypothesis` on `/problems`. Select Number theory; toggle sort. Filtering by solved correctly yields no independently established solved entries.
3. Open the Riemann problem. Inspect its KaTeX statement, exact Lean signature, pinned source lines, references, hashes and unknown/unverified labels.
4. Create a mock request. Simulate a result. Both a failed-route placeholder and a candidate-proof placeholder appear as **MOCK / unverified**. Reload: the journal persists. The problem status stays unknown.
5. Switch themes and inspect mobile width. Visit Sources and About for permissions and limitations.

## Documentation

- [Architecture & ADRs](docs/architecture.md)
- [Eight-source audit](docs/source-audit.md) and [bounded access receipts](docs/source-access.json)
- [Data contract & canonicalization](docs/data-contract.md)
- [Research Task API v1](docs/research-api.md)
- [PostgreSQL evolution schema](docs/postgresql-schema.sql) (design only; not migrated or connected)
- [Acceptance results](docs/acceptance-report.md)
- [Contributing](CONTRIBUTING.md), [license decisions](docs/license-decision.md), [third-party attribution](NOTICE)

## Project boundaries

**Math-CS-AI Atlas** maps learning and knowledge. **ConjMap** maps research problems and evidence. **MathForge** executes discovery, research, proofs and verification. ConjMap owns no MathForge execution logic and needs no access to its private repository.

The local adapter is not a public service: it has no user authentication, quota system, webhook signing, or production task scheduler. Loopback host/origin guards reduce accidental exposure; they are not production authentication. No deployment was configured. The JSON task store is for a single local workspace; writes are atomic with a per-task filesystem lock. Interrupted writes may leave temporary or lock files; inspect them before recovery. See the architecture document before evolving storage or exposing an API.

![ConjMap home](docs/screenshots/home-dark.png)
