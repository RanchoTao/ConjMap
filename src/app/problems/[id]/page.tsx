import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import { getProblem, problems, relationships } from '@/lib/catalog';
import { Badge } from '@/components/status';
import { MathText } from '@/components/math-text';
import { ResearchPanel } from '@/components/research-panel';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getProblem(id)?.title ?? 'Problem not found' };
}
export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = getProblem(id);
  if (!problem) notFound();
  const links = relationships.filter(
    (r) => r.source_id === problem.id || r.target_id === problem.id,
  );
  return (
    <div className="page-wrap detail-page">
      <Link href="/problems" className="back-link">
        <ArrowLeft size={15} /> Problem index
      </Link>
      <div className="detail-heading">
        <div className="eyebrow">
          {problem.field} <span>/ MSC {problem.MSC.join(' · ')}</span>
        </div>
        <h1>{problem.title}</h1>
        <div className="badge-row">
          <Badge>status: {problem.status}</Badge>
          <Badge tone="amber">statement: unverified</Badge>
          <span className="dim mono">{problem.id}</span>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          <section className="paper-panel">
            <div className="panel-heading">
              <span className="eyebrow">01 / MATHEMATICAL STATEMENT</span>
              <span className="dim">Source transcription</span>
            </div>
            <MathText text={problem.statement} />
            <p className="source-context">
              Transcribed from the documented theorem <code>{problem.aliases[1]}</code>. Definitions
              and context remain in the source file. No independent mathematical review has been
              performed.
            </p>
            <details>
              <summary>Formal statement · Lean 4</summary>
              <pre>{problem.formal_statement}</pre>
              <p className="muted">
                A statement is not a proof. This edition does not run Lean or validate the
                formalization.
              </p>
            </details>
          </section>
          <section className="paper-panel">
            <div className="eyebrow">02 / STATUS & EVIDENCE</div>
            <h2>What the source establishes</h2>
            <div className="status-comparison">
              <div>
                <small>UPSTREAM LABEL</small>
                <strong>research open</strong>
              </div>
              <span>→</span>
              <div>
                <small>CONJMAP STATUS</small>
                <strong>unknown</strong>
              </div>
            </div>
            {problem.status_evidence.map((e, i) => (
              <div key={i} className="evidence-item">
                <Badge tone="amber">{e.review_status}</Badge>
                <p>{e.claim}</p>
                <a href={e.url} target="_blank" rel="noreferrer">
                  Inspect pinned source, lines {problem.provenance.start_line}–
                  {problem.provenance.end_line} <ExternalLink size={13} />
                </a>
                <small>Source retrieved {e.accessed_at} · Mathematical verification: pending</small>
              </div>
            ))}
          </section>
          <section className="paper-panel">
            <div className="eyebrow">03 / REFERENCES</div>
            <h2>Follow the provenance</h2>
            <ol className="reference-list">
              {problem.references.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title}
                    <ArrowUpRight size={15} />
                  </a>
                  <small>{r.url}</small>
                </li>
              ))}
            </ol>
          </section>
          <section className="paper-panel">
            <div className="eyebrow">04 / RESEARCH RECORD</div>
            <h2>Attempts, including the dead ends.</h2>
            <p className="muted">
              No real research attempts are included in this snapshot. Exercise the integration
              contract below using local, clearly labeled mock records.
            </p>
            <ResearchPanel problemId={problem.id} />
          </section>
        </div>
        <aside className="detail-aside">
          <section className="aside-panel">
            <div className="eyebrow">PROBLEM PASSPORT</div>
            <dl>
              {[
                ['Canonical ID', problem.id],
                ['Proposed by', problem.proposed_by ?? 'Unknown'],
                ['Proposed year', problem.proposed_year?.toString() ?? 'Unknown'],
                ['Difficulty', problem.difficulty_estimate ?? 'Not assessed'],
                ['Last verified', problem.last_verified ?? 'Not independently verified'],
                ['Source retrieved', problem.provenance.retrieved_at],
                ['Content license', problem.provenance.license],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <details>
              <summary>Aliases & source mapping</summary>
              <p className="mono">{problem.aliases.join(' · ')}</p>
              {problem.source_mappings.map((m) => (
                <p className="mono" key={m.external_id}>
                  {m.source_id}
                  <br />
                  {m.external_id}
                </p>
              ))}
            </details>
            <details>
              <summary>Integrity receipt</summary>
              <p>Source revision</p>
              <code>{problem.provenance.revision}</code>
              <p>SHA-256 (LF source)</p>
              <code>{problem.provenance.sha256}</code>
            </details>
          </section>
          <section className="aside-panel">
            <div className="eyebrow">NEARBY QUESTIONS</div>
            <p className="muted small">
              Shared subject tags. Unverified discovery associations; no logical dependency is
              claimed.
            </p>
            {links.length ? (
              links.map((r) => {
                const other = problems.find(
                  (p) => p.id === (r.source_id === problem.id ? r.target_id : r.source_id),
                );
                return other ? (
                  <Link className="related-link" key={other.id} href={`/problems/${other.id}`}>
                    <span>
                      {other.title}
                      <small>
                        {r.type} · {r.review_status}
                      </small>
                    </span>
                    <ArrowUpRight size={15} />
                  </Link>
                ) : null;
              })
            ) : (
              <p className="muted">No relationships recorded.</p>
            )}
          </section>
          <div className="aside-note">
            Corrections move the map forward.
            <Link href="https://github.com/RanchoTao/ConjMap/issues/new">
              Suggest an evidence-backed edit <ArrowUpRight size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
