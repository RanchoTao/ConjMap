'use client';
import { useMemo, useState, useCallback } from 'react';
import { Atlas } from './atlas';
import type { Problem, Relationship } from '@/lib/schema';
type Measurement = {
  nodes: number;
  initial_render_ms: number;
  pan_frame_ms: number[];
  js_heap_bytes: number | null;
};
const colors: Record<string, string> = {};
export function GraphBenchmark({ template }: { template: Problem }) {
  const [count, setCount] = useState(100),
    [measurement, setMeasurement] = useState<Measurement | null>(null);
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
  const measure = useCallback((m: Measurement) => setMeasurement(m), []);
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <h1>Isolated synthetic graph benchmark</h1>
        <p>
          NOT MATHEMATICAL DATA. Uses the actual Atlas renderer; 20 programmatic pan-to-next-frame
          measurements. Heap is Chromium JS heap only, not total RSS/GPU memory.
        </p>
      </div>
      <select
        aria-label="Synthetic node count"
        value={count}
        onChange={(e) => {
          setMeasurement(null);
          setCount(Number(e.target.value));
        }}
      >
        {[100, 1000, 5000].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <Atlas
        problems={data.problems}
        relationships={data.relationships}
        colors={colors}
        onMeasurement={measure}
      />
      <pre data-testid="benchmark-result">
        {measurement ? JSON.stringify(measurement) : 'pending'}
      </pre>
    </div>
  );
}
