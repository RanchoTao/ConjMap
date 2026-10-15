import { expect, test } from '@playwright/test';

test('open frontier index is searchable, attributed and bilingual without changing math status', async ({ page }) => {
  await page.goto('/frontier');
  await expect(page.getByRole('heading', { name: 'Beyond the first 120.' })).toBeVisible();
  await expect(page.getByText('589', { exact: true })).toBeVisible();
  await page.getByLabel('Search source index').fill('Erdős Problem 3');
  await expect(page.getByRole('heading', { name: 'Erdős Problem 3', exact: true })).toBeVisible();
  await expect(page.getByText('Metadata only · no vetted statement').first()).toBeVisible();
  await page.getByLabel('Search source index').fill('');
  await page.getByLabel('Catalog linkage').selectOption('matched');
  await page.getByLabel('Search source index').fill('Erdős Problem 10');
  await expect(page.getByRole('link', { name: /Open existing dossier/ })).toBeVisible();
  await page.getByRole('button', { name: '切换到中文' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { name: '走出最初的 120 道题。' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '厄尔多斯问题 10' })).toBeVisible();
  await page.getByLabel('Search source index').fill('厄尔多斯问题 10');
  await expect(page.getByRole('heading', { name: '厄尔多斯问题 10' })).toBeVisible();
});
