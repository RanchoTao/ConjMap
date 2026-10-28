// Reads an existing authenticated ConjMap journal. Never starts MathForge or submits work.
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import { chromium } from '@playwright/test';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const captureFile = path.resolve(process.argv[2] ?? '');
if (!captureFile.startsWith(path.join(root, '.local') + path.sep))
  throw new Error('Owner-local capture path required');
const capture = JSON.parse(await readFile(captureFile, 'utf8'));
const auth = JSON.parse(
  await readFile(path.join(path.dirname(captureFile), 'local-auth.json'), 'utf8'),
);
const socket = net.createServer();
await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const run = path.join(path.dirname(captureFile), 'inspection-' + randomUUID());
await mkdir(run);
const common = Object.fromEntries(
  [
    'PATH',
    'Path',
    'SystemRoot',
    'WINDIR',
    'TEMP',
    'TMP',
    'PATHEXT',
    'APPDATA',
    'LOCALAPPDATA',
    'USERPROFILE',
  ]
    .filter((k) => process.env[k])
    .map((k) => [k, process.env[k]]),
);
const app = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)],
  {
    cwd: root,
    windowsHide: true,
    env: {
      ...common,
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'production',
      CONJMAP_MATHFORGE_URL: `http://127.0.0.1:${capture.enginePort}/v2/`,
      CONJMAP_MATHFORGE_TOKEN: auth.gateway,
      CONJMAP_CALLBACK_SECRET: auth.callback,
      CONJMAP_RESEARCH_ACCESS_TOKEN: auth.access,
      CONJMAP_REAL_TASK_DIR: capture.taskDir,
      CONJMAP_TASK_DIR: path.join(run, 'mock-unused'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
app.stdout.pipe(createWriteStream(path.join(run, 'stdout.txt'), { flags: 'wx' }));
app.stderr.pipe(createWriteStream(path.join(run, 'stderr.txt'), { flags: 'wx' }));
let browser;
try {
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Inspection server exited');
    try {
      if ((await globalThis.fetch(url, { signal: globalThis.AbortSignal.timeout(1000) })).ok) break;
    } catch {
      await pause(100);
    }
    if (i === 99) throw new Error('Inspection startup timed out');
  }
  browser = await chromium.launch();
  const page = await browser.newPage({ locale: 'en-US', viewport: { width: 1280, height: 1000 } });
  await page.addInitScript(() => globalThis.localStorage.setItem('conjmap-language-v1', 'en'));
  const errors = [],
    requests = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (request) => {
    if (request.url().includes('/api/v2/'))
      requests.push({ method: request.method(), path: new globalThis.URL(request.url()).pathname });
  });
  async function load() {
    await page.getByLabel(/Local research access token|本地研究访问令牌/).fill(auth.access);
    await page
      .getByRole('button', { name: /^Load real request history$|^加载研究请求历史$/ })
      .click();
    await page.getByText('REAL ADAPTER · COMPLETED', { exact: true }).waitFor();
  }
  await page.goto(url + '/problems/cm-000118');
  await load();
  await page.reload();
  await load();
  await page.screenshot({
    path: path.join(capture.publicFolder, 'browser-real-evidence-en.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: '切换到中文' }).click();
  await page.waitForFunction(() => globalThis.document.documentElement.lang === 'zh-CN');
  await page.screenshot({
    path: path.join(capture.publicFolder, 'browser-real-evidence-zh.png'),
    fullPage: true,
  });
  if (errors.length || requests.some((r) => r.method !== 'GET'))
    throw new Error('Inspection must be error-free and read-only');
  const report = {
    checked_at: new Date().toISOString(),
    persisted_after_reload: true,
    english_and_chinese: true,
    page_errors: errors,
    research_api_requests: requests,
    new_research_runs: 0,
    real_task_id: capture.task_id,
    engine_task_id: capture.engine_id,
    recovery_note:
      'First post-run browser reload check timed out on an English-only locator after language changed. This read-only reinspection fixes the locator and retains the original failure; no research replay.',
  };
  await writeFile(
    path.join(capture.publicFolder, 'BROWSER_CHECK.json'),
    JSON.stringify(report, null, 2),
    { flag: 'wx' },
  );
  console.log(
    JSON.stringify({
      inspection: 'PASS',
      real_research_runs: 1,
      new_research_runs: 0,
      engine_task_id: capture.engine_id,
      requests: requests.length,
    }),
  );
} finally {
  if (browser) await browser.close();
  if (app.exitCode === null) app.kill();
}
