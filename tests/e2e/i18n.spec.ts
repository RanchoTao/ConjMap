import { test, expect } from '@playwright/test';

test('Chinese / English switch persists across public routes and reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '切换到中文' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByText('众多领域，同一片前沿。')).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/home-zh.png', fullPage: true });

  await page.goto('/atlas');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { name: '数学图谱' })).toBeVisible();
  await page.getByLabel('Search atlas').fill('黎曼猜想');
  await expect(page.getByTestId('graph-count')).toContainText('1 个节点');

  await page.goto('/problems');
  await page.getByLabel('Search problems').fill('黎曼猜想');
  await expect(page.getByText('黎曼猜想', { exact: true })).toBeVisible();

  await page.goto('/problems/cm-000104');
  await expect(page.getByRole('heading', { name: '黎曼猜想' })).toBeVisible();
  await expect(page.getByText('以下为原始英文数学陈述，未以机器翻译替代正式命题。')).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');

  await page.goto('/sources');
  await expect(page.getByRole('heading', { name: '建立在可追溯来源之上' })).toBeVisible();
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: '面向未解问题的数学地图' })).toBeVisible();

  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'An atlas for the questions ahead' })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
