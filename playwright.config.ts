import { defineConfig, devices } from '@playwright/test';
import { randomUUID } from 'node:crypto';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    locale: 'en-US',
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start -- --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      CONJMAP_TASK_DIR: `.local/e2e-tasks/${randomUUID()}`,
      CONJMAP_REAL_TASK_DIR: `.local/e2e-real/${randomUUID()}`,
      CONJMAP_ENABLE_BENCHMARK: '1',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
