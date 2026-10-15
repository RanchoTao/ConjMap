import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import sources from '../../../data/sources.json';
import { manifest } from '@/lib/catalog';
import { Badge } from '@/components/status';
export const metadata: Metadata = { title: 'Sources & licenses' };
export default function SourcesPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow">PROVENANCE IS A FIRST-CLASS CITIZEN</div>
        <h1>
          Built on traceable sources<span className="title-period">.</span>
        </h1>
        <p>
          Eight resources audited on 15 October 2026. Availability, permissions, and mathematical
          accuracy are separate questions.
        </p>
      </div>
      <div className="source-summary">
        <div>
          <strong>08</strong>
          <small>Resources audited</small>
        </div>
        <div>
          <strong>01</strong>
          <small>Licensed source imported</small>
        </div>
        <div>
          <strong>{manifest.problem_count}</strong>
          <small>Unverified source statements</small>
        </div>
      </div>
      <div className="prose-banner">
        The code and imported repository material use Apache-2.0. Upstream authorship and license
        text are retained in <code>data/upstream/formal-conjectures</code>. No license is granted
        over linked third-party websites or papers.
      </div>
      <div style={{ marginTop: 28 }}>
        {sources.map((s) => (
          <article key={s.id} className="source-card">
            <div>
              <h2>{s.name}</h2>
              <Badge tone={s.decision === 'imported' ? 'muted' : 'amber'}>
                {s.decision === 'imported'
                  ? `${s.imported} records imported`
                  : 'Audit only · no import'}
              </Badge>
              <div className="source-links">
                <a href={s.url} target="_blank" rel="noreferrer">
                  Visit source <ArrowUpRight size={12} />
                </a>
                <a href={s.audit_url} target="_blank" rel="noreferrer">
                  Evidence <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
            <div>
              <p>{s.quality}</p>
              <dl>
                {[
                  ['Access', s.access],
                  ['License', s.license],
                  ['Maintenance', s.maintenance],
                  ['Format', s.format],
                  ['Update frequency', s.frequency],
                  ['Import constraints', s.risk],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>
      <p className="evidence-note">
        Full audit, reproducible source inventory, licensing decisions, and limitations are tracked
        in the repository documentation. Observations are dated; website availability and status may
        change.
      </p>
    </div>
  );
}
