# Research Task API · v1

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
