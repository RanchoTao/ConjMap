import { test, expect } from '@playwright/test';

test('V0.4 real-run archive is read-only, source-bound and bilingual without mathematical promotion', async ({
  page,
}) => {
  const posts: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().includes('/api/')) posts.push(r.url());
  });
  await page.goto('/problems/fc-wikipedia-unionclosed');
  const archive = page.getByTestId('archived-real-run');
  await expect(archive).toContainText('REAL_RUN · COMPLETED');
  await expect(archive).toContainText('mf-audit-86c955e76307455994ecb1b84c74a81d');
  await expect(archive).toContainText('16 families examined, 13 applicable');
  await expect(page.getByText('status: unknown', { exact: true })).toBeVisible();
  await expect(archive.getByRole('link')).toHaveAttribute(
    'href',
    /2d75b06233dc142535695640545c3309fbc6ccf4/,
  );
  await page.screenshot({ path: 'docs/screenshots/v04-archived-real-run.png', fullPage: true });
  await archive.screenshot({ path: 'docs/screenshots/v04-real-run-card.png' });
  await page.getByRole('button', { name: '切换到中文' }).click();
  await expect(archive).toContainText('不是一般猜想的证明');
  await page.reload();
  await expect(archive).toContainText('已归档的真实执行');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/screenshots/v04-evidence-mobile-zh.png', fullPage: true });
  expect(posts).toEqual([]);
});

test('V0.4 keeps challenged history, scoped evidence dimensions and candidate-only graph projection', async ({
  page,
}) => {
  await page.goto('/problems/cm-000008');
  const panel = page.getByTestId('v04-review-panel');
  await expect(panel).toContainText('0 fully cleared, 0 mathematically verified');
  await expect(panel.locator('[data-review-dimension="PROOF_KERNEL_VERIFIED"]')).toContainText(
    'NOT_RUN',
  );
  await expect(panel.locator('[data-review-dimension="HUMAN_REVIEWED"]')).toContainText('NOT_RUN');
  await panel
    .getByText('Related relationship review history (English records)', { exact: true })
    .click();
  await expect(panel.locator('[data-relation-review="relation-v02-01"]')).toContainText(
    'Challenged / withheld from graph',
  );
  await page.goto('/atlas');
  await expect(page.getByTestId('atlas-review-overlay')).toContainText(
    '9 active mathematical candidates; 3 challenged',
  );
  await page.getByLabel('Graph layer').selectOption('logic');
  await expect(page.getByTestId('graph-count')).toContainText('0 links');
  await page.getByLabel('Show unverified candidates').check();
  await expect(page.getByTestId('graph-count')).not.toContainText('0 links');
});
