'use client';

import Link from 'next/link';
import { useLanguage } from './i18n';
import type { ReviewPanelData } from '@/lib/v04-reviews';

const dimensionLabels = {
  SOURCE_VERIFIED: ['Pinned source bytes', '固定版本来源字节'],
  STATEMENT_VERIFIED: ['Scoped statement comparison', '限定范围陈述核对'],
  LITERATURE_REVIEWED: ['Literature review', '文献审查'],
  FORMAL_STATEMENT_CHECKED: ['Formal statement correspondence', '形式化陈述对应'],
  PROOF_KERNEL_VERIFIED: ['Proof kernel verification', '证明内核核验'],
  HUMAN_REVIEWED: ['Human expert review', '人工专家审查'],
  MATHEMATICALLY_VERIFIED: ['Mathematical verification', '数学结论核验'],
} as const;
const statusLabels = {
  DONE: ['Scoped check completed', '限定范围检查完成'],
  PARTIAL: ['Partial', '部分完成'],
  NOT_RUN: ['Not run', '未执行'],
} as const;

export function V04ReviewPanel({ dossier, scopedProblems, relations, totals }: ReviewPanelData) {
  const { language } = useLanguage();
  const zh = language === 'zh';
  return (
    <div data-testid="v04-review-panel">
      <div className="eyebrow">{zh ? 'V0.4 / 追加审查记录' : 'V0.4 / APPENDED REVIEW'}</div>
      <h3>{zh ? '审查进展与未关闭义务' : 'Review progress and remaining obligations'}</h3>
      <p className="muted small">
        {zh
          ? `${totals.dossiers} 份限定范围档案均为 PARTIAL；严格审查完成 ${totals.fullyCleared}，数学核验 ${totals.verified}。自动审查不等于人工专家批准，也不改变问题状态。`
          : `${totals.dossiers} scoped dossiers remain PARTIAL; ${totals.fullyCleared} fully cleared, ${totals.verified} mathematically verified. Automated review is not human expert approval and does not change problem status.`}
      </p>
      <details>
        <summary>{zh ? '本轮三个审查范围' : 'Three scoped reviews in this release'}</summary>
        <ul>
          {scopedProblems.map((row) => (
            <li key={row.problem_id}>
              <Link href={`/problems/${row.problem_id}`}>{row.title}</Link> · {row.completion}
            </li>
          ))}
        </ul>
      </details>
      {dossier ? (
        <article data-testid="v04-dossier-review" className="task-record">
          <p className="muted small">
            {dossier.id} · v{dossier.version} · PARTIAL
          </p>
          <p className="muted small">
            {zh ? '保留历史版本：' : 'Historical version retained: '}
            {dossier.supersedes}
          </p>
          <dl className="evidence-dimensions">
            {Object.entries(dossier.dimensions).map(([key, dimension]) => (
              <div key={key} data-review-dimension={key}>
                <dt>{dimensionLabels[key as keyof typeof dimensionLabels][zh ? 1 : 0]}</dt>
                <dd>
                  <strong>{statusLabels[dimension.status][zh ? 1 : 0]}</strong> · {dimension.status}
                  <details>
                    <summary>
                      {zh ? '检查范围（英文原始记录）' : 'Exact scope (English review record)'}
                    </summary>
                    <p>{dimension.scope}</p>
                    <code>{key}</code>
                  </details>
                </dd>
              </div>
            ))}
          </dl>
          <details>
            <summary>
              {zh ? '未关闭义务（英文原始记录）' : 'Remaining obligations (English review record)'}
            </summary>
            <ul>
              {dossier.open_obligations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        </article>
      ) : (
        <p className="muted small">
          {zh
            ? '本问题未被纳入这三个限定范围审查；历史证据维度继续保留。'
            : 'This problem is outside the three scoped reviews; its historical evidence dimensions remain unchanged.'}
        </p>
      )}
      <p className="prose-banner" data-testid="v04-relation-summary">
        {zh
          ? `原有 12 条关系全部保留：${totals.activeCandidates} 条为活动候选，${totals.challenged} 条需纠正并暂停图谱展示；已核验 0 条。`
          : `All 12 original relationships are retained: ${totals.activeCandidates} active candidates, ${totals.challenged} challenged and withheld from the graph; 0 verified.`}
      </p>
      {relations.length > 0 ? (
        <details>
          <summary>
            {zh
              ? '相关关系审查历史（英文原始记录）'
              : 'Related relationship review history (English records)'}
          </summary>
          {relations.map((row) => (
            <article className="task-record" key={row.id} data-relation-review={row.relation_id}>
              <strong>
                {row.relation_id} ·{' '}
                {row.disposition === 'CORRECTION_REQUIRED'
                  ? zh
                    ? '需纠正 / 图谱已暂停展示'
                    : 'Challenged / withheld from graph'
                  : zh
                    ? '候选 / 未核验'
                    : 'Candidate / unverified'}
              </strong>
              <p>{row.summary}</p>
              <p>{row.direction}</p>
              <p className="muted small">{row.counterexample_or_variant_risk}</p>
            </article>
          ))}
        </details>
      ) : null}
    </div>
  );
}
