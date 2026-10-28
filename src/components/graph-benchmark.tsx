'use client';
import { useMemo, useState, useCallback } from 'react';
import { Atlas, type GraphMeasurement, type RenderDetail } from './atlas';
import type { Problem, Relationship } from '@/lib/schema';
const colors: Record<string, string> = {};
export function GraphBenchmark({ template }: { template: Problem }) {
  const [count, setCount] = useState(100),
    [detail, setDetail] = useState<RenderDetail>('full'),
    [generation, setGeneration] = useState(0),
    [measurement, setMeasurement] = useState<GraphMeasurement | null>(null);
  const data = useMemo(() => {
    const problems = Array.from({ length: count }, (_, i) => ({
      ...template,
      id: `synthetic-${i}`,
      title: `SYNTHETIC stress node ${i}`,
      field: `Synthetic group ${i % 6}`,
    }));
    const relationships: Relationship[] = Array.from({ length: count - 1 }, (_, i) => ({
      source_id: problems[i].id,
      target_id: problems[i + 1].id,
      type: 'related_to',
      evidence_url: 'https://example.invalid/synthetic',
      evidence_urls: ['https://example.invalid/synthetic'],
      review_status: 'unverified',
      review_date: null,
      basis: 'Synthetic workload only; not mathematical data.',
    }));
    return { problems, relationships };
  }, [count, template]);
  const measure = useCallback((m: GraphMeasurement) => setMeasurement(m), []);
  const repeat = () => {
    setMeasurement(null);
    setGeneration((current) => current + 1);
  };
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <h1>Isolated synthetic graph benchmark</h1>
        <p>
          NOT MATHEMATICAL DATA. Uses the actual Atlas renderer; 20 programmatic pan-to-next-frame
          measurements. Heap is Chromium JS heap only, not total RSS/GPU memory.
        </p>
        <p>
          Full detail preserves the normal Atlas renderer. Reduced detail hides unselected canvas
          labels, uses straight edges and hides edges during viewport gestures. Complete names,
          search and the keyboard node index remain available. Each repeat remounts the graph; it
          does not clear browser caches or force garbage collection.
        </p>
      </div>
      <select
        aria-label="Synthetic node count"
        value={count}
        onChange={(e) => {
          setMeasurement(null);
          setCount(Number(e.target.value));
          setGeneration((current) => current + 1);
        }}
      >
        {[100, 1000, 5000].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <select
        aria-label="Synthetic render detail"
        value={detail}
        onChange={(e) => {
          setDetail(e.target.value as RenderDetail);
          repeat();
        }}
      >
        <option value="full">Full detail</option>
        <option value="reduced">Reduced detail</option>
      </select>
      <button type="button" onClick={repeat}>
        Repeat graph benchmark
      </button>
      <Atlas
        key={`${count}-${detail}-${generation}`}
        problems={data.problems}
        relationships={data.relationships}
        colors={colors}
        onMeasurement={measure}
        renderDetail={detail}
      />
      <pre data-testid="benchmark-result" data-generation={generation}>
        {measurement ? JSON.stringify({ ...measurement, generation }) : 'pending'}
      </pre>
    </div>
  );
}
