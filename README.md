# ConjMap

**Mapping the Frontiers of Mathematics.** An open, interactive, evidence-traceable research map. V0.2 adds licensed multi-source observations, evidence dimensions and a guarded MathForge transport. **Overall PARTIAL:** 30 scoped dossiers await rigorous clearance; no real MathForge run was possible through the inspected controller.

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
- Two independent licensed adapters: Formal Conjectures statements and 32 Erdős community metadata observations mapped to existing problems. Neutral `cm-000001` IDs retain all legacy `fc-*` links. Second-source observations add **0** independent problems.
- 30 scoped PARTIAL dossiers, seven separate evidence dimensions and append-only review versions. **0 fully cleared dossiers.** Primary literature leads and full-method review gaps are explicit.
- 12 substantive source-reviewed **candidate** relations and 12 declaration nodes (not additional problems); 0 verified relations. Separate navigation, logic, special-case and research-evidence layers; candidates require an explicit toggle.
- Research API v1 remains **mock-only**. Independent v2 supports authenticated submission, status polling, signed callbacks, quotas, idempotency and immutable event snapshots. Default requests become **BLOCKED**; no real engine result is fabricated.
- Isolated opt-in `/bench` exercises the actual renderer with 100/1,000/5,000 synthetic nodes. [Measured results](docs/performance/v02-graph-benchmark.json) are engineering evidence only.

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

Python adapter checks require `python -m pip install -r requirements-adapters.txt` (PyYAML, no research service). `npm run check` runs both data validators, lint, typecheck, unit tests and build. Playwright starts its own production server on port 3100, tests browser interactions and API boundaries, and writes screenshots and benchmark measurements. CI uploads reports. See the PR and [V0.2 acceptance report](docs/acceptance-v0.2.md) for executed results; the [V0.1 report](docs/acceptance-report.md) is historical.

## Minimal end-to-end acceptance

1. Run `npm run dev`. Open `/atlas`; pan, zoom, select a node, and follow “Read problem & evidence”. Alternatively use the keyboard-accessible node index.
2. Search `riemannHypothesis` on `/problems`. Select Number theory; toggle sort. Filtering by solved correctly yields no independently established solved entries.
3. Open the Riemann problem. Inspect its KaTeX statement, exact Lean signature, pinned source lines, references, hashes and unknown/unverified labels.
4. Create a mock request. Simulate a result. Both a failed-route placeholder and a candidate-proof placeholder appear as **MOCK / unverified**. Reload: the journal persists. The problem status stays unknown.
5. Switch themes and inspect mobile width. Visit Sources and About for permissions and limitations.
6. On Atlas select Mathematical logic: verified-only has no links. Enable unverified candidates to inspect amber dashed relations; inspect hypotheses and pinned declarations on problem details.
7. On a dossier page inspect seven evidence dimensions and literature gaps. On Erdős #10 inspect the second-source metadata separately from the mathematical statement/status.
8. Request a real MathForge audit with default configuration: the durable local record is BLOCKED, engine task ID not issued, actual runs 0. Reload and load real request history. This is not a successful research run.

## Documentation

- [Architecture & ADRs](docs/architecture.md)
- [Eight-source audit](docs/source-audit.md) and [bounded access receipts](docs/source-access.json)
- [Data contract & canonicalization](docs/data-contract.md)
- [Research Task API v1 mock / v2 real transport](docs/research-api.md)
- [30 scoped mathematical dossiers and remaining gaps](docs/mathematical-audit-v0.2.md)
- [MathForge capability discovery and integration blocker](docs/mathforge-discovery-v0.2.md)
- [PostgreSQL evolution schema](docs/postgresql-schema.sql) (design only; not migrated or connected)
- [Acceptance results](docs/acceptance-report.md)
- [Contributing](CONTRIBUTING.md), [license decisions](docs/license-decision.md), [third-party attribution](NOTICE)

## Project boundaries

**Math-CS-AI Atlas** maps learning and knowledge. **ConjMap** maps research problems and evidence. **MathForge** executes discovery, research, proofs and verification. ConjMap owns no MathForge execution logic and needs no access to its private repository.

The application binds loopback. V1 is an unauthenticated local mock; V2 adds bearer authentication when configured, signed callbacks, active-task quotas and a separate journal. It remains a local integration boundary, with no public production service, deployment or scheduler configured. JSON stores require trusted filesystem access; interrupted writes may leave locks or unmatched snapshots that require reconciliation before recovery. See the architecture document before evolving storage or exposing an API.

![ConjMap home](docs/screenshots/home-dark.png)
