import type { Metadata } from 'next';
import { ProblemExplorer } from '@/components/problem-explorer';
import { EvidenceNote } from '@/components/status';
import { fields, problems } from '@/lib/catalog';
export const metadata: Metadata = { title: 'Problems' };
export default function ProblemsPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow">THE PROBLEM INDEX</div>
        <h1>
          Questions worth asking<span className="title-period">.</span>
        </h1>
        <p>
          {problems.length} traceable statements across {fields.length} fields. A starting point for
          exploration.
        </p>
      </div>
      <ProblemExplorer problems={problems} fields={fields} initial={{}} />
      <EvidenceNote />
    </div>
  );
}
