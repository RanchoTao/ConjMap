import { test, expect } from '@playwright/test';
test('home, actual graph nodes, zoom and accessible node navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Every answer begins/ })).toBeVisible();
  await expect(page.getByTestId('atlas-canvas')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByTestId('graph-count')).toHaveText('120 nodes · 82 links');
  await page.screenshot({ path: 'docs/screenshots/home-dark.png', fullPage: true });
  await page.getByRole('link', { name: 'Explore the atlas', exact: true }).click();
  await expect(page.getByTestId('atlas-canvas')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await page.getByRole('button', { name: 'Fit graph', exact: true }).click();
  await page.getByLabel('Atlas field').selectOption('Number theory');
  await expect(page.getByTestId('graph-count')).toContainText('30 nodes');
  await page.getByLabel('Search atlas').fill('riemannHypothesis');
  await expect(page.getByTestId('graph-count')).toHaveText('1 nodes · 0 links');
  await page.getByText('Accessible node index').click();
  await page.getByRole('button', { name: 'Riemann hypothesis', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Riemann hypothesis' })).toBeVisible();
  await page.getByRole('link', { name: 'Read problem & evidence' }).click();
  await expect(
    page.getByRole('heading', { name: 'Riemann hypothesis', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.katex').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Inspect pinned source/ })).toHaveAttribute(
    'href',
    /2c24ebe.*#L/,
  );
  expect(errors).toEqual([]);
});
test('atlas filtering, empty state, link toggle and actual canvas node selection', async ({
  page,
}) => {
  await page.goto('/atlas');
  await expect(page.getByTestId('atlas-canvas')).toHaveAttribute('data-ready', 'true');
  await page.screenshot({ path: 'docs/screenshots/atlas-desktop.png', fullPage: true });
  await page.getByLabel('Discovery links').uncheck();
  await expect(page.getByTestId('graph-count')).toHaveText('120 nodes · 0 links');
  await page.getByLabel('Atlas status').selectOption('solved');
  await expect(page.getByText('No problems match these filters.')).toBeVisible();
  await page.getByLabel('Atlas status').selectOption('');
  await page.getByLabel('Search atlas').fill('riemannHypothesis');
  await expect(page.getByTestId('graph-count')).toHaveText('1 nodes · 0 links');
  // A single result centers the node itself; select it by an actual canvas click.
  const canvas = page.getByTestId('atlas-canvas');
  const box = (await canvas.boundingBox())!;
  await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
  await expect(page.locator('.node-detail')).toBeVisible();
  await expect(page.locator('.node-detail')).toContainText('Riemann hypothesis');
  await page.getByLabel('Close node details').click();
  const visible = (await canvas.boundingBox())!;
  await page.mouse.move(visible.x + 60, visible.y + 100);
  await page.mouse.down();
  await page.mouse.move(visible.x + 140, visible.y + 100, { steps: 10 });
  await page.mouse.up();
  await canvas.click({ position: { x: box.width / 2 + 80, y: box.height / 2 } });
  await expect(page.locator('.node-detail')).toBeVisible();
});
test('problem search, composed filters, sort, pagination and permalink', async ({ page }) => {
  await page.goto('/problems');
  await expect(page.locator('.result-meta')).toContainText('120 problems found');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.pagination')).toContainText('21–40');
  await page.getByLabel('Filter by field').selectOption('Analysis');
  await expect(page.locator('.result-meta')).toContainText('16 problems found');
  await page.getByLabel('Sort problems').selectOption('title-desc');
  const first = await page.locator('.problem-row strong').first().textContent();
  await page.getByLabel('Sort problems').selectOption('title-asc');
  expect(await page.locator('.problem-row strong').first().textContent()).not.toBe(first);
  await page.reload();
  await expect(page.getByLabel('Filter by field')).toHaveValue('Analysis');
  await page.getByLabel('Filter by status').selectOption('solved');
  await expect(page.getByRole('heading', { name: 'No matching problems' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByLabel('Search problems').fill('riemannHypothesis');
  await expect(page.locator('.problem-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.screenshot({ path: 'docs/screenshots/problems-light.png', fullPage: true });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.problem-row').click();
  await expect(page.getByText('research open', { exact: true })).toBeVisible();
  await expect(page.getByText('No real research attempts', { exact: false })).toBeVisible();
});
test('mock task submit, query, failed route, candidate and browser reload persistence', async ({
  page,
  request,
}) => {
  await page.goto('/problems/fc-millennium-riemannhypothesis');
  await page.getByRole('button', { name: 'Create mock request', exact: true }).click();
  await expect(page.locator('.task-record').first()).toContainText('MOCK · queued');
  await page.getByRole('button', { name: 'Simulate result (mock)', exact: true }).first().click();
  await expect(page.locator('.task-record').first()).toContainText('MOCK · completed');
  await expect(page.getByText('Failed route · MOCK', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Candidate proof · MOCK', { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.locator('.task-record').first()).toContainText('MOCK · completed');
  await page.screenshot({ path: 'docs/screenshots/problem-evidence.png', fullPage: true });
  const invalid = await request.post('/api/v1/research-tasks', {
    data: {
      api_version: 'v1',
      engine: 'real-mathforge',
      problem_id: 'fc-millennium-riemannhypothesis',
      objective: 'Never submit real research',
    },
  });
  expect(invalid.status()).toBe(400);
  const cross = await request.post('/api/v1/research-tasks', {
    headers: { Origin: 'https://example.com' },
    data: {},
  });
  expect(cross.status()).toBe(403);
  const malformed = await request.post('/api/v1/research-tasks', {
    headers: { 'Content-Type': 'application/json' },
    data: '{',
  });
  expect(malformed.status()).toBe(400);
});
test('all public pages, 404 and mobile layout have no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    '/',
    '/atlas',
    '/problems',
    '/problems/fc-millennium-riemannhypothesis',
    '/sources',
    '/about',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (route === '/') {
      await expect(page.getByTestId('atlas-canvas')).toHaveAttribute('data-ready', 'true');
      await page.screenshot({ path: 'docs/screenshots/home-mobile.png', fullPage: true });
    }
  }
  expect((await page.goto('/problems/no-such-canonical-id'))?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This problem isn’t indexed.' })).toBeVisible();
});
test('HTTP task lifecycle accepts evidence, queries status, rejects replay and forged verification', async ({
  request,
}) => {
  const submitted = await request.post('/api/v1/research-tasks', {
    data: {
      api_version: 'v1',
      engine: 'mock-mathforge',
      problem_id: 'fc-wikipedia-abc',
      objective: 'Exercise a result callback with evidence links.',
    },
  });
  expect(submitted.status()).toBe(201);
  const task = await submitted.json();
  expect((await request.get(`/api/v1/research-tasks/${task.id}`)).status()).toBe(200);
  const data = {
    api_version: 'v1',
    engine: 'mock-mathforge',
    is_mock: true,
    attempts: [
      {
        engine: 'mock-mathforge',
        is_mock: true,
        kind: 'failed_route',
        hypothesis: '[MOCK] Callback contract',
        method: '[MOCK] Transport only',
        result: '[MOCK] No mathematics was executed.',
        verification_status: 'unverified',
        artifact_urls: ['https://example.org/unverified-fixture'],
      },
    ],
  };
  const forged = await request.post(`/api/v1/research-tasks/${task.id}/results`, {
    data: { ...data, attempts: [{ ...data.attempts[0], verification_status: 'verified' }] },
  });
  expect(forged.status()).toBe(400);
  const completed = await request.post(`/api/v1/research-tasks/${task.id}/results`, { data });
  expect(completed.status()).toBe(200);
  expect((await completed.json()).attempts[0].artifact_urls).toEqual([
    'https://example.org/unverified-fixture',
  ]);
  expect((await request.post(`/api/v1/research-tasks/${task.id}/results`, { data })).status()).toBe(
    409,
  );
  expect((await request.get('/api/v1/research-tasks/not-a-uuid')).status()).toBe(400);
  expect(
    (await request.get('/api/v1/research-tasks/00000000-0000-4000-8000-000000000000')).status(),
  ).toBe(404);
});
