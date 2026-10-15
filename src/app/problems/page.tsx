import type { Metadata } from 'next';
import { ProblemExplorer } from '@/components/problem-explorer';
import { EvidenceNote } from '@/components/status';
import { fields, problems } from '@/lib/catalog';
import type { Filters } from '@/lib/query';
export const metadata: Metadata = { title: 'Problems' };
export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial: Filters = {};
  for (const key of ['q', 'field', 'status', 'sort'] as const)
    if (typeof params[key] === 'string') initial[key] = params[key];
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
      <ProblemExplorer problems={problems} fields={fields} initial={initial} />
      <EvidenceNote />
    </div>
  );
}
