import type { Metadata } from 'next';
import { Atlas } from '@/components/atlas';
import { EvidenceNote } from '@/components/status';
import { problems, relationships, fieldColors } from '@/lib/catalog';
import { substantiveRelations, claims } from '@/lib/v02-data';
export const metadata: Metadata = { title: 'Atlas' };
export default function AtlasPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow">THE RESEARCH LANDSCAPE</div>
        <h1>
          The atlas<span className="title-period">.</span>
        </h1>
        <p>Follow a question. Discover its neighborhood. Find a new direction.</p>
      </div>
      <Atlas
        problems={problems}
        relationships={relationships}
        colors={fieldColors}
        mathematical={substantiveRelations}
        statements={claims}
      />
      <EvidenceNote />
    </div>
  );
}
