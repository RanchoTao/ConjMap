import { dossiers, reviews, sourceRecords, claims, substantiveRelations } from '@/lib/v02-data';
import type { Problem } from '@/lib/schema';
export function EvidencePassport({ problem }: { problem: Problem }) {
  const dossier = dossiers.find((d) => d.problem_id === problem.id),
    review = reviews.get(problem.id);
  const records = sourceRecords.filter((s) => problem.aliases.includes(s.legacy_problem_id));
  const nearby = substantiveRelations.filter(
    (r) => r.source_id === problem.id || r.target_id === problem.id,
  );
  return (
    <section className="paper-panel">
      <div className="eyebrow">V0.2 / EVIDENCE DIMENSIONS & SOURCE HISTORY</div>
      <h2>Review scope, without collapsed certainty.</h2>
      {review ? (
        <>
          <p className="muted small">
            {review.reviewer} · {review.reviewed_at} · v{review.version} · {dossier?.completion}
          </p>
          <dl className="evidence-dimensions">
            {Object.entries(review.dimensions).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p>{dossier?.scope_review}</p>
          <div className="prose-banner">{dossier?.findings}</div>
          <details>
            <summary>Search scope, limitations & literature leads</summary>
            <p>{dossier?.search_query}</p>
            <p>{dossier?.literature_access}</p>
            <p>{dossier?.original_reference_status}</p>
            {dossier?.literature_leads.map((u) => (
              <p key={u}>
                <a href={u} target="_blank" rel="noreferrer">
                  {u}
                </a>
              </p>
            ))}
            {dossier?.gaps.map((g) => (
              <p key={g}>{g}</p>
            ))}
          </details>
        </>
      ) : (
        <p className="muted small">
          No scoped V0.2 dossier for this problem yet. Source imported; all other evidence
          dimensions remain pending/not run.
        </p>
      )}
      <h3 style={{ marginTop: 22 }}>Cross-source observations</h3>
      {records.length ? (
        records.map((r) => (
          <article className="task-record" key={r.id}>
            <strong>Erdős community metadata #{r.external_id}</strong>
            <p className="muted small">
              {r.status_scope} This observation does not change ConjMap status.
            </p>
            <pre>
              {JSON.stringify(
                {
                  informal_status: r.raw_metadata.informal_status,
                  formal_status: r.raw_metadata.formal_status,
                  status: r.raw_metadata.status,
                },
                null,
                2,
              )}
            </pre>
            <p>
              <a className="text-link" href={r.url} target="_blank" rel="noreferrer">
                Pinned metadata revision ↗
              </a>
            </p>
            <small>
              Metadata Apache-2.0 · {r.attribution} · Text not imported · Retrieved {r.retrieved_at}
            </small>
          </article>
        ))
      ) : (
        <p className="muted small">No second-source observation linked to this record.</p>
      )}
      {nearby.length ? (
        <>
          <h3 style={{ marginTop: 22 }}>Substantive relationship candidates</h3>
          {nearby.map((r) => (
            <details key={r.id}>
              <summary>{r.type} · source-reviewed candidate · UNVERIFIED</summary>
              <p>{r.hypotheses.join(' ')}</p>
              <p>{r.scope}</p>
              <a className="text-link" href={r.evidence_url} target="_blank" rel="noreferrer">
                Inspect {r.locator} ↗
              </a>
              <pre>
                {claims.find((c) => c.id === r.source_id || c.id === r.target_id)?.formal_statement}
              </pre>
              <p>
                Source version {r.source_revision} · {r.review_date} · Human approval pending; no
                accepted proof receipt.
              </p>
            </details>
          ))}
        </>
      ) : null}
    </section>
  );
}
