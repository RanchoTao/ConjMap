import { notFound } from 'next/navigation';
import { GraphBenchmark } from '@/components/graph-benchmark';
import { problems } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export default function Benchmark() {
  if (process.env.CONJMAP_ENABLE_BENCHMARK !== '1') notFound();
  return <GraphBenchmark template={problems[0]} />;
}
