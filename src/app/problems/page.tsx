import type { Metadata } from 'next';
import { T } from '@/components/i18n';
import { ProblemExplorer } from '@/components/problem-explorer';
import { EvidenceNote } from '@/components/status';
import { fields, problems } from '@/lib/catalog';
export const metadata: Metadata = { title: 'Problems' };
export default function ProblemsPage() {
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div className="eyebrow"><T en="THE PROBLEM INDEX" /></div>
        <h1>
          Questions worth asking<span className="title-period">.</span>
        </h1>
        <p>
          {problems.length} <T en="traceable statements across" zh="条可追溯陈述，覆盖" /> {fields.length} <T en="fields." zh="个领域。" /> <T en="A starting point for exploration." />
        </p>
      </div>
      <ProblemExplorer problems={problems} fields={fields} initial={{}} />
      <EvidenceNote />
    </div>
  );
}
