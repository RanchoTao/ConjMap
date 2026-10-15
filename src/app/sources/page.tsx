import type { Metadata } from 'next';
import { T } from '@/components/i18n';
import { ArrowUpRight } from 'lucide-react';
import sources from '../../../data/sources.json';
import { manifest } from '@/lib/catalog';
import { Badge } from '@/components/status';
export const metadata: Metadata = { title: 'Sources & licenses' };
export default function SourcesPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow"><T en="PROVENANCE IS A FIRST-CLASS CITIZEN" /></div>
        <h1>
          Built on traceable sources<span className="title-period">.</span>
        </h1>
        <p>
          <T en="Eight resources audited on 15 October 2026. Availability, permissions, and mathematical accuracy are separate questions." zh="截至 2026 年 10 月 15 日，已审计八项资源。可访问性、使用许可与数学正确性是不同问题。" />
        </p>
      </div>
      <div className="source-summary">
        <div>
          <strong>08</strong>
          <small><T en="Resources audited" /></small>
        </div>
        <div>
          <strong>02</strong>
          <small><T en="Licensed sources integrated" /></small>
        </div>
        <div>
          <strong>{manifest.problem_count}</strong>
          <small><T en="Unverified source statements" /></small>
        </div>
      </div>
      <div className="prose-banner">
        <T en="The code and imported repository material use Apache-2.0. Upstream authorship and license text are retained in" zh="代码及已导入仓库材料使用 Apache-2.0；原作者署名和许可证文本保存在" /> <code>data/upstream/formal-conjectures</code>. <T en="No license is granted over linked third-party websites or papers." zh="该许可不延伸至链接的第三方网站或论文。" />
      </div>
      <div style={{ marginTop: 28 }}>
        {sources.map((s) => (
          <article key={s.id} className="source-card">
            <div>
              <h2>{s.name}</h2>
              <Badge tone={s.decision === 'imported' ? 'muted' : 'amber'}>
                {s.decision === 'imported'
                  ? <>{s.imported} <T en="records imported" zh="条记录已导入" /></>
                  : <T en="Audit only · no import" />}
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
              <p className="muted small"><T en="Source assessment (original English notes)" zh="来源评估（英文原始审计记录）" /></p>
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
                    <dt><T en={k} /></dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>
      <p className="evidence-note">
        <T en="Full audit, reproducible source inventory, licensing decisions, and limitations are tracked in the repository documentation. Observations are dated; website availability and status may change." zh="完整审计、可复现的来源清单、许可证决定与限制均记录于仓库文档。观察结果具有日期，网站可访问性和问题状态可能发生变化。" />
      </p>
    </div>
  );
}
