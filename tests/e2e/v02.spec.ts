import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { arch, platform, cpus, totalmem } from 'node:os';
test('V0.2 separates graph layers and scoped evidence from mathematical verification', async ({
  page,
}) => {
  await page.goto('/atlas');
  await expect(page.getByTestId('atlas-canvas')).toHaveAttribute('data-ready', 'true');
  await page.getByLabel('Graph layer').selectOption('logic');
  await expect(page.getByTestId('graph-count')).toContainText('0 links');
  await page.getByLabel('Show unverified candidates').check();
  await expect(page.getByTestId('graph-count')).not.toContainText('0 links');
  await page.screenshot({ path: 'docs/screenshots/v02-candidate-logic.png', fullPage: true });
  await page.getByLabel('Show unverified candidates').uncheck();
  await expect(page.getByTestId('graph-count')).toContainText('0 links');
  await page.getByLabel('Graph layer').selectOption('research_evidence');
  await expect(page.getByTestId('graph-count')).toContainText('0 links');
  await page.goto('/problems/fc-wikipedia-fuglede');
  await expect(page.getByText('SOURCE_IMPORTED', { exact: true })).toBeVisible();
  await expect(page.getByText('PROOF_KERNEL_VERIFIED', { exact: true })).toBeVisible();
  await expect(page.getByText('status: unknown', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/screenshots/v02-evidence-mobile.png', fullPage: true });
  await page.goto('/problems/fc-erdosproblems-10');
  await expect(page.getByText('Erdős community metadata #10', { exact: true })).toBeVisible();
});
test('synthetic 100/1000/5000-node render, pan latency and JS heap measurements', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/bench');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const rows: Record<string, unknown>[] = [];
  for (const count of [100, 1000, 5000]) {
    await page.getByLabel('Synthetic node count').selectOption(String(count));
    await expect(page.getByTestId('benchmark-result')).not.toHaveText('pending', {
      timeout: 45000,
    });
    const metrics = JSON.parse((await page.getByTestId('benchmark-result').textContent())!);
    const memory = (await cdp.send('Performance.getMetrics')).metrics;
    expect(metrics.nodes).toBe(count);
    expect(metrics.pan_frame_ms).toHaveLength(20);
    const values = [...metrics.pan_frame_ms].sort((a: number, b: number) => a - b);
    rows.push({
      ...metrics,
      js_heap_bytes: memory.find((m) => m.name === 'JSHeapUsedSize')?.value ?? null,
      js_heap_total_bytes: memory.find((m) => m.name === 'JSHeapTotalSize')?.value ?? null,
      memory_method: 'Chromium DevTools Performance.getMetrics; JS heap, no forced GC',
      pan_p50_ms: values[Math.ceil(values.length * 0.5) - 1],
      pan_p95_ms: values[Math.ceil(values.length * 0.95) - 1],
      quantile_method: 'nearest rank over 20 pan frames',
      workload: 'synthetic-only',
      renderer: 'actual Atlas/Cytoscape preset',
      viewport: '1280x900',
      edges: count - 1,
      repeat_count: 1,
    });
  }
  mkdirSync('docs/performance', { recursive: true });
  writeFileSync(
    'docs/performance/v02-graph-benchmark.json',
    JSON.stringify(
      {
        measured_at: new Date().toISOString(),
        browser: page.context().browser()?.version() ?? 'Chromium',
        environment: {
          platform: platform(),
          architecture: arch(),
          cpu: cpus()[0]?.model,
          logical_cpus: cpus().length,
          system_memory_bytes: totalmem(),
        },
        results: rows,
        limitations: [
          'One run per size; no statistical performance guarantee.',
          'JS heap excludes native/GPU allocations; total process memory not measured.',
          'Initial render includes element replacement and two animation frames, excludes HTTP/server time.',
          'Pan latency is scripted panBy to next frame, not hardware input-to-photon latency.',
          'No synthetic node enters the canonical catalog.',
        ],
      },
      null,
      2,
    ),
  );
  await cdp.detach();
});
