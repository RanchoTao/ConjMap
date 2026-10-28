import type { Metadata } from 'next';
import { T } from '@/components/i18n';
import { Atlas } from '@/components/atlas';
import { EvidenceNote } from '@/components/status';
import { problems, relationships, fieldColors } from '@/lib/catalog';
import { claims } from '@/lib/v02-data';
import { activeSubstantiveRelations, reviewTotals } from '@/lib/v04-reviews';
export const metadata: Metadata = { title: 'Atlas' };
export default function AtlasPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow">
          <T en="THE RESEARCH LANDSCAPE" />
        </div>
        <h1>
          <T en="The atlas" />
          <span className="title-period">.</span>
        </h1>
        <p>
          <T en="Follow a question. Discover its neighborhood. Find a new direction." />
        </p>
      </div>
      <Atlas
        problems={problems}
        relationships={relationships}
        colors={fieldColors}
        mathematical={activeSubstantiveRelations}
        statements={claims}
      />
      <p className="muted small" data-testid="atlas-review-overlay">
        <T
          en={`${reviewTotals.activeCandidates} active mathematical candidates; ${reviewTotals.challenged} challenged relationships remain in source history and are withheld from this graph. 0 verified.`}
          zh={`${reviewTotals.activeCandidates} 条活动数学关系候选；${reviewTotals.challenged} 条需纠正的关系保留在来源历史中，图谱暂不展示。已核验 0 条。`}
        />
      </p>
      <EvidenceNote />
    </div>
  );
}
