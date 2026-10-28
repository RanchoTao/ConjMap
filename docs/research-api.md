# Research Task API · v1 mock and v2 real transport

## V0.4 additive execution protocol

The historical V0.2 availability notes below are preserved; one real calibration has
now completed. The normal unconfigured runtime still returns BLOCKED. A compatible
engine is not a generic authorization: MathForge owns a reviewed admission allowlist.
`admission_id` is optional in the local request schema and mandatory for the admitted
gateway task. Outbound context adds original source ID/revision/path/SHA and UTF8
statement SHA. Engine admissions reject any source, variant, budget or history drift.

V2 operational result states additionally include `rejected`, `interrupted`, `cancelled`.
`execution_mode` distinguishes REAL_RUN from CONTRACT_TEST; legacy unsigned fixtures
cannot become real evidence. Every claimed REAL_RUN response requires an HMAC envelope
whose raw canonical payload binds protocol, both task identities, problem/admission,
source/statement/admission/worker hashes, engine commit, status, exact attempt narrative,
artifact names/sizes/hashes and measured resources. Shared owner-local HMAC trust is not
public-key or mathematical verification. Persisted receipts are rechecked when loaded.

Authenticated local operations:

- `POST /<uuid>/reconcile`: lookup `<engine-base>/research-tasks/by-key/<original-key>`;
  never POSTs another research submission or changes its original context.
- `POST /<uuid>/cancel`: persists intent, forwards cancellation and waits for authenticated
  state; timeout stays uncertain and a concurrent terminal result cannot be overwritten.
- `GET /<uuid>/artifacts/<name>`: only names in the signed index; bounds1MiB, refuses
  redirect/arbitrary URLs, checks SHA/size, writes immutable local evidence and serves
  escaped browser text. Existing cached evidence can be inspected without a live engine.

An authentic failed/interrupted receipt may record up to5s termination/accounting
overhead beyond its requested worker budget (receipt absolute cap65s). The exact value
and warning are preserved; this does not extend worker execution or claim an in-budget
success. Completed receipts must stay within the requested budget. The engine's actual
watchdog is independent of journal contention. The captured real run took0.164s against
30s and remains unverified mathematically.

See `mathforge-real-integration-v0.4.md` for the real engine ID, actual artifact index,
startup/UI failure preservation and explicit no-replay recovery rules. No production
service or credentials are provisioned by normal `npm run dev`.

## V0.2 historical availability and inherited V2 contract

Base `/api/v2/research-tasks`. The default runtime is **BLOCKED**, engine task ID null, actual runs 0. A compatible MathForge HTTP API was not found; source-bound controller admission cannot be bypassed. Contract-fixture tests are not real MathForge execution. See `mathforge-discovery-v0.2.md`.

Four configuration values are required: `CONJMAP_MATHFORGE_URL` (loopback only, no embedded credentials/query/fragment), `CONJMAP_MATHFORGE_TOKEN` (outbound engine bearer), `CONJMAP_RESEARCH_ACCESS_TOKEN` (inbound local bearer), `CONJMAP_CALLBACK_SECRET` (HMAC callback). Each secret must be at least 32 characters. The app still binds loopback and applies V1 host/origin/body boundaries. No production credentials are configured. The problem-page token input remains in page memory, never browser storage or request bodies.

Submit `POST` with JSON and `Idempotency-Key` (16–100 alphanumeric/hyphen characters); when configured require `Authorization: Bearer <research access token>`:

```json
{"problem_id":"cm-000104","objective":"Audit exact source hypotheses without a solved-status claim.","budget":{"wall_seconds":30,"max_tasks":1,"network":false}}
```

Return 201 for accepted bound engine tasks, 202 for locally blocked records. Without configuration, a blocked record can be created/read locally without bearer; it makes no network call. Request context includes canonical ID, exact original statement/Lean signature, references, source mappings, current unknown/unverified state and explicitly empty independently established results. No established result is fabricated from an audit lead.

Configured outbound `POST <base>/research-tasks` includes `api_version:v2`, `conjmap_task_id`, input and context, engine bearer and same idempotency key. Journal writes before network; redirect following is disabled, timeout 5 seconds, response 64KiB max. Engine must enforce the declared one-task/60-second/no-network budget. Global idempotency rejects changed payload even across problems. At most 3 submitted/queued/running/uncertain tasks are active. Uncertain submission blocks automatic retry: reconcile with engine by the original key. The UI retains the key during page lifetime; after reload inspect history before issuing another request.

- `GET ?problem_id=<id>`: configuration blocked/configured and persistent tasks; `GET /<uuid>` reads one task. Bearer required when configured.
- `POST /<uuid>/poll`: bearer required, GETs `<base>/research-tasks/<encoded engine ID>`, never resubmits. Unchanged responses do not append duplicate events; changed responses append `engine_poll`.
- `POST /<uuid>/results`: signed callback, no bearer replacement for signature. JSON raw-body HMAC SHA-256 is `sha256=<lowercase hex>` in `X-ConjMap-Signature`, computed over `<X-ConjMap-Timestamp>.<raw UTF-8 body>`. Timestamp is 13-digit Unix milliseconds within ±5 minutes. Loopback host/origin, 64KiB limit and strict schema still apply.

Engine response / callback:

```json
{"engine":"mathforge","is_mock":false,"engine_task_id":"ENGINE-ISSUED-ID","status":"running","attempts":[{"kind":"failed_route","result":"Engine-owned actual log summary, if a real run exists.","verification_status":"unverified","artifact_urls":[]}]}
```

Process states: queued/running/completed/failed/blocked; attempts: failed_route/candidate_proof/counterexample/partial_result. Engine identity must match the submitted task. Running→queued, repeated result digest and terminal overwrites return 409. Attempt verification must be literal unverified; mock payloads, solved status and extra fields are rejected. Artifacts are HTTP(S) links only; never downloaded/executed by this app. A completed task never changes catalog status.

Each task has UTC events/digests and exclusive historical snapshots in `CONJMAP_REAL_TASK_DIR` (default `.local/real-tasks`). Trusted local filesystem access is assumed. A global lock serializes writes; atomic rename publishes current JSON. Snapshot-before-current crashes need manual reconciliation, not history deletion. These journals are ignored by Git. Audit snapshots are not tamperproof or remotely backed up. This transport is tested local infrastructure; engine compatibility, real authorization and end-to-end scientific execution remain unestablished.

V2 adds 401 invalid bearer/signature, 429 active quota, 502 polling failure, 503 unconfigured credentials/engine; shared V1 error limits below still apply. Missing callback configuration returns 503 and records no claimed engine result.

## V1 preserved mock contract

Base path `/api/v1/research-tasks`. This version is a **local mock contract**, not a connection to MathForge. No private repository, engine credential, server-side research computation, or genuine proof is involved.

## Submit

`POST /api/v1/research-tasks`, `Content-Type: application/json`:

```json
{"api_version":"v1","problem_id":"fc-millennium-riemannhypothesis","engine":"mock-mathforge","objective":"Exercise the local evidence workflow."}
```

Returns 201 with `id` (UUID), `api_version`, `problem_id`, `engine`, `objective`, `is_mock:true`, `status:queued`, UTC `created_at`/`updated_at`, and empty `attempts`.

## Query

- `GET /api/v1/research-tasks/<id>` → task or 404.
- `GET /api/v1/research-tasks?problem_id=<canonical-id>` → `{api_version:"v1",is_mock:true,tasks:[...]}`. A known problem is required.
- GET does not advance task state. Reloading the app/server reads the on-disk journal.

## Receive result and evidence

`POST /api/v1/research-tasks/<id>/results`:

```json
{
  "api_version":"v1",
  "engine":"mock-mathforge",
  "is_mock":true,
  "attempts":[{
    "engine":"mock-mathforge",
    "is_mock":true,
    "kind":"failed_route",
    "hypothesis":"[MOCK] Contract exercise only.",
    "method":"[MOCK] No mathematical method was executed.",
    "result":"[MOCK] A demonstration dead end, not a research result.",
    "verification_status":"unverified",
    "artifact_urls":[]
  }]
}
```

Returns completed task with server-assigned problem/run IDs and timestamps on each attempt. The other accepted kind is `candidate_proof`. The candidate is still unverified and mock, regardless of the submitted prose. The UI labels every attempt. External HTTP(S) artifact URLs are permitted but never fetched or executed by the server. No callback can set a proof to verified or change a problem's status.

`POST /api/v1/research-tasks/<id>/simulate` generates deterministic failed-route and candidate placeholders, each with explicit MOCK text and no evidence. This only exercises transport, persistence and rendering. “Completed” means the mock callback was recorded, not that any mathematics was solved.

## Boundary and errors

Only loopback hosts (`127.0.0.1`, `localhost`, `::1`) are accepted, with same-host Origin when provided; cross-site fetch metadata is rejected. Local CLI clients without Origin are supported. This is not authentication and must not be exposed as a public API. Use `npm start`/`dev` defaults, which bind loopback.

- 400: malformed JSON, invalid UUID, schema violation, unknown extra fields, attempted real engine, or fake verification.
- 403: host/origin boundary violation.
- 404: valid unknown task or unknown problem.
- 409: concurrent update or repeated completion; completed evidence is immutable.
- 413: JSON body over 64 KiB (streamed limit, not dependent on Content-Length).
- 415: non-JSON request body on JSON endpoints.
- 500: corrupt/unwritable local journal; internal paths are not returned.

Strict schemas limit objective to 2,000 characters, hypotheses/methods to 4,000, results to 12,000, artifacts to 20 per attempt, and attempts to 10 per callback. `Cache-Control:no-store` applies to API responses.

## Evolution boundary

`ResearchAdapter` in `src/lib/research-contract.ts` has `submit`, `get`, `list`, and `receive`. Implement a real engine behind a separately reviewed adapter, without moving research execution into ConjMap. Add authenticated/signed callbacks, provenance and independent verification receipts, engine state mapping, explicit failure/cancellation states, and a real artifact policy before enabling it. V1's mock-only schema must not be weakened silently. See `postgresql-schema.sql` for the unexecuted storage design.
