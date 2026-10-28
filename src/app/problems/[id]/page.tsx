import Link from 'next/link';
import { T, ProblemName } from '@/components/i18n';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import { getProblem, problems, relationships } from '@/lib/catalog';
import { Badge } from '@/components/status';
import { MathText } from '@/components/math-text';
import { ResearchPanel } from '@/components/research-panel';
import { EvidencePassport } from '@/components/evidence-passport';
import { RealResearchPanel } from '@/components/real-research-panel';
import {ArchivedRunPanel} from '@/components/archived-run-panel';
// Pre-render every canonical problem page for GitHub Pages without a Node server.
export function generateStaticParams() {
  const ids = new Set(problems.flatMap((problem) => [
    problem.id,
    ...problem.aliases.filter((alias) => alias.startsWith('fc-')),
  ]));
  return [...ids].map((id) => ({ id }));
}
export const dynamicParams = false;

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
          <T en={problem.field} /> <span>/ MSC {problem.MSC.join(' · ')}</span>
        </div>
        <h1><ProblemName title={problem.title} /></h1>
        <div className="badge-row">
          <Badge><T en="status: " /> <T en={problem.status} /></Badge>
          <Badge tone="amber"><T en="statement: unverified" /></Badge>
          <span className="dim mono">{problem.id}</span>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          <ArchivedRunPanel problemId={problem.id}/>
          <EvidencePassport problem={problem} />
          <section className="paper-panel">
            <div className="panel-heading">
              <span className="eyebrow"><T en="01 / MATHEMATICAL STATEMENT" /></span>
              <span className="dim"><T en="Source transcription" /></span>
            </div>
            <p className="muted small"><T en="Original source statement (English); not independently translated." zh="以下为原始英文数学陈述，未以机器翻译替代正式命题。" /></p>
            <MathText text={problem.statement} />
            <p className="source-context">
              <T en="Transcribed from the documented theorem" zh="转录自定理" /> <code>{problem.aliases[1]}</code>。<T en="Definitions and context remain in the source file. No independent mathematical review has been performed." zh="定义与上下文仍以原始文件为准，尚未完成独立数学审查。" />
            </p>
            <details>
              <summary><T en="Formal statement · Lean 4" /></summary>
              <pre>{problem.formal_statement}</pre>
              <p className="muted">
                <T en="A statement is not a proof. This edition does not run Lean or validate the formalization." />
              </p>
            </details>
          </section>
          <section className="paper-panel">
            <div className="eyebrow"><T en="02 / STATUS & EVIDENCE" /></div>
            <h2><T en="What the source establishes" /></h2>
            <div className="status-comparison">
              <div>
                <small><T en="UPSTREAM LABEL" /></small>
                <strong><T en="research open" /></strong>
              </div>
              <span>→</span>
              <div>
                <small><T en="CONJMAP STATUS" /></small>
                <strong><T en="unknown" /></strong>
              </div>
            </div>
            {problem.status_evidence.map((e, i) => (
              <div key={i} className="evidence-item">
                <Badge tone="amber"><T en={e.review_status} /></Badge>
                <p>{e.claim}</p>
                <a href={e.url} target="_blank" rel="noreferrer">
                  <T en="Inspect pinned source, lines" zh="查看固定版本来源，第" /> {problem.provenance.start_line}–
                  {problem.provenance.end_line} <ExternalLink size={13} />
                </a>
                <small><T en="Source retrieved" zh="来源获取日期" /> {e.accessed_at} · <T en="Mathematical verification: pending" zh="数学验证：待完成" /></small>
              </div>
            ))}
          </section>
          <section className="paper-panel">
            <div className="eyebrow"><T en="03 / REFERENCES" /></div>
            <h2><T en="Follow the provenance" /></h2>
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
            <div className="eyebrow"><T en="04 / RESEARCH RECORD" /></div>
            <h2><T en="Attempts, including the dead ends." /></h2>
            <p className="muted">
              <T en="No real research attempts are included in this snapshot. Exercise the integration contract below using local, clearly labeled mock records." zh="当前快照尚无真实研究记录。下方本地模拟接口仅用于验证任务通信流程。" />
            </p>
            {process.env.CONJMAP_STATIC_EXPORT === '1' ? (
              <p className="muted"><T en="Research execution is only available in the local ConjMap edition. The public atlas is read-only." zh="研究执行仅在 ConjMap 本地版本提供；公开图谱为只读模式。" /></p>
            ) : (
              <ResearchPanel problemId={problem.id} />
            )}
          </section>
          {process.env.CONJMAP_STATIC_EXPORT !== '1' ? (
            <RealResearchPanel key={problem.id} problemId={problem.id} />
          ) : null}
        </div>
        <aside className="detail-aside">
          <section className="aside-panel">
            <div className="eyebrow"><T en="PROBLEM PASSPORT" /></div>
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
                  <dt><T en={String(k)} /></dt>
                  <dd><T en={String(v)} /></dd>
                </div>
              ))}
            </dl>
            <details>
              <summary><T en="Aliases & source mapping" /></summary>
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
              <summary><T en="Integrity receipt" /></summary>
              <p><T en="Source revision" /></p>
              <code>{problem.provenance.revision}</code>
              <p><T en="SHA-256 (LF source)" /></p>
              <code>{problem.provenance.sha256}</code>
            </details>
          </section>
          <section className="aside-panel">
            <div className="eyebrow"><T en="NEARBY QUESTIONS" /></div>
            <p className="muted small">
              <T en="Shared subject tags. Unverified discovery associations; no logical dependency is claimed." zh="根据共享学科标签建立的探索关联，尚未核验，不代表逻辑依赖。" />
            </p>
            {links.length ? (
              links.map((r) => {
                const other = problems.find(
                  (p) => p.id === (r.source_id === problem.id ? r.target_id : r.source_id),
                );
                return other ? (
                  <Link className="related-link" key={other.id} href={`/problems/${other.id}`}>
                    <span>
                      <ProblemName title={other.title} />
                      <small>
                        <T en={r.type} /> · <T en={r.review_status} />
                      </small>
                    </span>
                    <ArrowUpRight size={15} />
                  </Link>
                ) : null;
              })
            ) : (
              <p className="muted"><T en="No relationships recorded." /></p>
            )}
          </section>
          <div className="aside-note">
            <T en="Corrections move the map forward." zh="通过纠错，让地图更准确。" />
            <Link href="https://github.com/RanchoTao/ConjMap/issues/new">
              Suggest an evidence-backed edit <ArrowUpRight size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
