import { T } from './i18n';
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
      <div className="eyebrow"><T en="V0.2 / EVIDENCE DIMENSIONS & SOURCE HISTORY" /></div>
      <h2><T en="Review scope, without collapsed certainty." /></h2>
      {review ? (
        <>
          <p className="muted small">
            {review.reviewer} · {review.reviewed_at} · v{review.version} · {dossier?.completion}
          </p>
          <dl className="evidence-dimensions">
            {Object.entries(review.dimensions).map(([key, value]) => (
              <div key={key}>
                <dt><T en={key} /></dt>
                <dd><T en={value} /></dd>
              </div>
            ))}
          </dl>
          <p className="muted small"><T en="Source dossier notes (English original)" zh="以下为英文原始研究审查记录，尚未独立核验或翻译。" /></p>
          <p>{dossier?.scope_review}</p>
          <div className="prose-banner">{dossier?.findings}</div>
          <details>
            <summary><T en="Search scope, limitations & literature leads" /></summary>
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
          <T en="No scoped V0.2 dossier for this problem yet. Source imported; all other evidence dimensions remain pending/not run." zh="目前尚无该问题的 V0.2 详细审查记录。来源已导入，其他核验尚待执行。" />
        </p>
      )}
      <h3 style={{ marginTop: 22 }}><T en="Cross-source observations" /></h3>
      {records.length ? (
        records.map((r) => (
          <article className="task-record" key={r.id}>
            <strong><T en="Erdős community metadata" zh="厄尔多斯社区元数据" /> #{r.external_id}</strong>
            <p className="muted small">
              {r.status_scope} <T en="This observation does not change ConjMap status." zh="该观察不改变 ConjMap 中问题的核验状态。" />
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
                <T en="Pinned metadata revision ↗" zh="查看固定版本元数据 ↗" />
              </a>
            </p>
            <small>
              Metadata Apache-2.0 · {r.attribution} · Text not imported · Retrieved {r.retrieved_at}
            </small>
          </article>
        ))
      ) : (
        <p className="muted small"><T en="No second-source observation linked to this record." /></p>
      )}
      {nearby.length ? (
        <>
          <h3 style={{ marginTop: 22 }}><T en="Substantive relationship candidates" /></h3>
          {nearby.map((r) => (
            <details key={r.id}>
              <summary>{r.type} · <T en="source-reviewed candidate · UNVERIFIED" zh="来源已审查的候选关系 · 未核验" /></summary>
              <p>{r.hypotheses.join(' ')}</p>
              <p>{r.scope}</p>
              <a className="text-link" href={r.evidence_url} target="_blank" rel="noreferrer">
                Inspect {r.locator} ↗
              </a>
              <pre>
                {claims.find((c) => c.id === r.source_id || c.id === r.target_id)?.formal_statement}
              </pre>
              <p>
                <T en="Source version" zh="来源版本" /> {r.source_revision} · {r.review_date} · <T en="Human approval pending; no accepted proof receipt." zh="待人工审核；尚无通过的证明凭据。" />
              </p>
            </details>
          ))}
        </>
      ) : null}
    </section>
  );
}
