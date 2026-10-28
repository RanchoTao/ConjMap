import { expect, test } from '@playwright/test';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, totalmem } from 'node:os';
import type { GraphMeasurement, RenderDetail } from '../../src/components/atlas';

type Sample = GraphMeasurement & {
  generation: number;
  repeat: number;
  pan_p50_ms: number;
  pan_p95_ms: number;
  cdp_js_heap_used_bytes: number;
  cdp_js_heap_total_bytes: number;
};
const nearestRank = (values: number[], fraction: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * fraction) - 1];
};

test('V0.4 actual Atlas: full/reduced detail, three repeats at 100/1000/5000 nodes', async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/bench');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const results: Sample[] = [];
  mkdirSync(testInfo.outputDir, { recursive: true });
  const partialPath = testInfo.outputPath('v04-samples.jsonl');
  writeFileSync(partialPath, '', { flag: 'wx' });
  const output = page.getByTestId('benchmark-result');
  try {
    for (const mode of ['full', 'reduced'] as RenderDetail[]) {
      if ((await page.getByLabel('Synthetic render detail').inputValue()) !== mode)
        await page.getByLabel('Synthetic render detail').selectOption(mode);
      for (const count of [100, 1000, 5000]) {
        if ((await page.getByLabel('Synthetic node count').inputValue()) !== String(count))
          await page.getByLabel('Synthetic node count').selectOption(String(count));
        for (let repeat = 1; repeat <= 3; repeat++) {
          if (repeat > 1) {
            const previous = Number(await output.getAttribute('data-generation'));
            await page.getByRole('button', { name: 'Repeat graph benchmark', exact: true }).click();
            await expect
              .poll(async () => Number(await output.getAttribute('data-generation')))
              .toBeGreaterThan(previous);
          }
          const generation = Number(await output.getAttribute('data-generation'));
          await expect
            .poll(
              async () => {
                const value = await output.textContent();
                if (!value || value === 'pending') return null;
                const parsed = JSON.parse(value) as Sample;
                return `${parsed.nodes}:${parsed.render_detail}:${parsed.generation}`;
              },
              { timeout: 30000 },
            )
            .toBe(`${count}:${mode}:${generation}`);
          const metrics = JSON.parse((await output.textContent())!) as GraphMeasurement & {
            generation: number;
          };
          await expect(page.getByTestId('atlas-canvas')).toHaveAttribute('data-ready', 'true');
          await expect(page.getByTestId('atlas-canvas')).toHaveAttribute(
            'data-render-detail',
            mode,
          );
          await expect(page.getByTestId('atlas-canvas').locator('canvas').first()).toBeVisible();
          expect(metrics.nodes).toBe(count);
          expect(metrics.edges).toBe(count - 1);
          expect(metrics.pan_frame_ms).toHaveLength(20);
          expect(metrics.pan_frame_ms.every((value) => Number.isFinite(value) && value >= 0)).toBe(
            true,
          );
          expect(metrics.initial_render_ms).toBeGreaterThan(0);
          expect(metrics.graph_render_events).toBeGreaterThan(0);
          const memory = (await cdp.send('Performance.getMetrics')).metrics;
          const used = memory.find((item) => item.name === 'JSHeapUsedSize')?.value;
          const total = memory.find((item) => item.name === 'JSHeapTotalSize')?.value;
          expect(used).toBeGreaterThan(0);
          expect(total).toBeGreaterThanOrEqual(used!);
          results.push({
            ...metrics,
            repeat,
            pan_p50_ms: nearestRank(metrics.pan_frame_ms, 0.5),
            pan_p95_ms: nearestRank(metrics.pan_frame_ms, 0.95),
            cdp_js_heap_used_bytes: used!,
            cdp_js_heap_total_bytes: total!,
          });
          appendFileSync(partialPath, JSON.stringify(results[results.length - 1]) + '\n');
        }
      }
    }
    // Reduced canvas labels do not remove full names or keyboard selection.
    await page.getByRole('button', { name: 'Fit graph', exact: true }).focus();
    await expect(page.getByRole('button', { name: 'Fit graph', exact: true })).toBeFocused();
    await page.locator('summary').filter({ hasText: 'Accessible node index' }).click();
    const node = page.getByRole('button', { name: 'SYNTHETIC stress node 0', exact: true });
    await node.focus();
    await node.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'SYNTHETIC stress node 0', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('Synthetic benchmark node; no catalog problem page.'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Read problem & evidence' })).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(results).toHaveLength(18);
    const summary = (['full', 'reduced'] as RenderDetail[]).flatMap((mode) =>
      [100, 1000, 5000].map((nodes) => {
        const samples = results.filter((row) => row.render_detail === mode && row.nodes === nodes);
        expect(samples).toHaveLength(3);
        const pooled = samples.flatMap((row) => row.pan_frame_ms);
        return {
          nodes,
          render_detail: mode,
          repeats: samples.length,
          pooled_pan_frames: pooled.length,
          pooled_pan_p50_ms: nearestRank(pooled, 0.5),
          pooled_pan_p95_ms: nearestRank(pooled, 0.95),
          median_initial_render_ms: nearestRank(
            samples.map((row) => row.initial_render_ms),
            0.5,
          ),
          median_cdp_js_heap_used_bytes: nearestRank(
            samples.map((row) => row.cdp_js_heap_used_bytes),
            0.5,
          ),
        };
      }),
    );
    const document = {
      schema_version: 'conjmap-performance/0.4',
      measured_at: new Date().toISOString(),
      browser: page.context().browser()?.version() ?? 'Chromium',
      environment: {
        platform: platform(),
        architecture: arch(),
        cpu: cpus()[0]?.model,
        logical_cpus: cpus().length,
        system_memory_bytes: totalmem(),
      },
      viewport: { width: 1280, height: 900 },
      workload: 'SYNTHETIC ONLY; n nodes in six groups, sparse chain of n-1 unverified edges',
      renderer: 'actual Atlas/Cytoscape canvas, preset layout',
      measurement_order:
        'full 100/1000/5000 then reduced 100/1000/5000; three consecutive remounts each',
      quantile_method: 'nearest rank; per-repeat 20 frames, pooled 60 frames per size/mode',
      memory_method:
        'Chromium DevTools Performance.getMetrics; JS heap snapshots without forced GC',
      console_errors: errors,
      results,
      summary,
      limitations: [
        'Three repeats are descriptive only, not a statistical performance guarantee or p95 service-level objective.',
        'Pan time is scripted panBy to the next requestAnimationFrame; it is not hardware input-to-photon latency.',
        'Initial render starts before graph element replacement and includes two frames; excludes HTTP, module download and React setup.',
        'Cytoscape render events and visible canvas confirm renderer activity, not pixel-accurate presentation timing.',
        'JS heap excludes native renderer/GPU allocations and process RSS. Sequential runs share browser caches and GC history.',
        'Full and reduced modes trade label/edge detail; the test does not assert the reduced mode must be faster.',
        'Programmatic panBy may not activate gesture-only edge hiding; this is not a drag-gesture benchmark.',
        'The sparse chain workload does not characterize a dense real research graph; no synthetic data enters the catalog.',
        'Each repeat remounts the Atlas; no cache eviction or forced garbage collection is performed.',
        'Historical V0.2 measurements are preserved; comparisons across different hosts/browsers are not controlled.',
      ],
    };
    const serialized = `${JSON.stringify(document, null, 2)}\n`;
    mkdirSync(testInfo.outputDir, { recursive: true });
    const runPath = testInfo.outputPath('v04-graph-benchmark.json');
    writeFileSync(runPath, serialized);
    await testInfo.attach('V0.4 measured performance', {
      path: runPath,
      contentType: 'application/json',
    });
    mkdirSync('docs/performance', { recursive: true });
    // Preserve the first canonical receipt; reruns emit their own Playwright artifact.
    const canonical = 'docs/performance/v04-graph-benchmark.json';
    if (!existsSync(canonical)) writeFileSync(canonical, serialized, { flag: 'wx' });
  } finally {
    await cdp.detach().catch(() => {});
  }
});
