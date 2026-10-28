// Opt-in owner-authorized single REAL_RUN driver. Never used by tests or CI.
import { spawn, execFileSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { setTimeout } from 'node:timers';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { fetch, AbortSignal } = globalThis;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = (raw) => createHash('sha256').update(raw).digest('hex');
const json = (raw) => JSON.parse(raw.toString('utf8'));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const git = (repo, ...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
export function assertPublicEvidence(raw) {
  const text = raw.toString('utf8');
  if (
    /[A-Z]:[\\/]+Users[\\/]+|\/(?:home|Users)\/[^/]+\/|-----BEGIN .*PRIVATE KEY|sk-proj-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}/i.test(
      text,
    )
  )
    throw new Error(
      'Potential private path/credential in evidence; retain locally, do not publish',
    );
}
export function assertPreSubmissionRecovery(failure, requestFileExists) {
  if (
    requestFileExists ||
    failure.task_id !== null ||
    !Array.isArray(failure.transcript) ||
    failure.transcript.length
  )
    throw new Error('Submission may have started; lookup-only reconciliation is required');
}
async function port() {
  const socket = net.createServer();
  await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', resolve);
  });
  const value = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  return value;
}
function baseEnv() {
  return Object.fromEntries(
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
}
function launch(executable, args, cwd, env, folder, label) {
  const output = createWriteStream(path.join(folder, `${label}.stdout.txt`), { flags: 'wx' });
  const error = createWriteStream(path.join(folder, `${label}.stderr.txt`), { flags: 'wx' });
  const process = spawn(executable, args, {
    cwd,
    env,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  process.stdout.pipe(output);
  process.stderr.pipe(error);
  process.on('error', () => {});
  return process;
}

export async function main(args = process.argv.slice(2)) {
  const option = (name) => {
    const at = args.indexOf(name);
    return at < 0 ? null : args[at + 1];
  };
  if (!option('--mathforge-root') || !option('--history-root'))
    throw new Error('Explicit --mathforge-root and --history-root required');
  const engineRoot = path.resolve(option('--mathforge-root'));
  const historyRoot = path.resolve(option('--history-root'));
  const review = json(
    await readFile(path.join(engineRoot, 'docs/CONJMAP_GATEWAY_DESK_REVIEW_V04.json')),
  );
  for (const [name, hash] of Object.entries(review.sha256)) {
    if (sha(await readFile(path.join(engineRoot, name))) !== hash)
      throw new Error(`Reviewed engine file drift: ${name}`);
  }
  if (git(engineRoot, 'status', '--porcelain', '--untracked-files=no'))
    throw new Error('Engine checkout has tracked changes; pin reviewed code first');
  await access(path.join(root, '.next/BUILD_ID'));
  const plan = {
    protocol: 'conjmap-real-integration-v04',
    engine_commit: git(engineRoot, 'rev-parse', 'HEAD'),
    conjmap_commit: git(root, 'rev-parse', 'HEAD'),
    admission_id: 'cm-v04-union-closed-fin2-v1',
    problem_id: 'cm-000118',
    max_tasks: 1,
    wall_seconds: 30,
    network: false,
  };
  if (!args.includes('--execute-one-real-task')) {
    console.log(JSON.stringify({ preflight: 'PASS', executed: false, ...plan }));
    return;
  }
  const local = path.join(root, '.local/v04');
  await mkdir(local, { recursive: true });
  let uid = randomUUID(),
    key = `conjmap-v04-${uid}`,
    priorFailure = null;
  let folder = path.join(local, uid);
  if (args.includes('--resume-pre-submission')) {
    const owner = json(await readFile(path.join(local, 'OWNER_REAL_TASK.json')));
    uid = owner.uid;
    key = owner.key;
    const original = path.join(local, uid);
    priorFailure = json(await readFile(path.join(original, 'FAILURE.json')));
    const requestExists = await access(path.join(original, 'REQUEST.json')).then(
      () => true,
      () => false,
    );
    assertPreSubmissionRecovery(priorFailure, requestExists);
    if (owner.engine_commit !== plan.engine_commit || owner.admission_id !== plan.admission_id)
      throw new Error('Original admission/code changed; explicit recovery audit required');
    folder = path.join(original, 'pre-submission-' + randomUUID());
  } else {
    // Exclusive owner slot. Never change the key after an uncertain research submission.
    await writeFile(
      path.join(local, 'OWNER_REAL_TASK.json'),
      JSON.stringify({ ...plan, uid, key, created_at: new Date().toISOString() }, null, 2),
      { flag: 'wx' },
    );
  }
  await mkdir(folder, { recursive: false });
  const enginePort = await port(),
    appPort = await port();
  const secrets = {
    gateway: randomBytes(48).toString('base64url'),
    callback: randomBytes(48).toString('base64url'),
    access: randomBytes(48).toString('base64url'),
  };
  // Owner-local recovery material; never output, commit, screenshot or put keys on a command line.
  await writeFile(path.join(folder, 'local-auth.json'), JSON.stringify(secrets), {
    flag: 'wx',
    mode: 0o600,
  });
  const taskDir = path.join(folder, 'tasks');
  const engineJournal = `reports/local/conjmap-v04-${uid}`;
  const common = baseEnv();
  let gateway, app;
  const transcript = [];
  const appUrl = `http://127.0.0.1:${appPort}`;
  async function api(route, init = {}) {
    const response = await fetch(appUrl + route, {
      ...init,
      redirect: 'error',
      headers: { Authorization: `Bearer ${secrets.access}`, ...init.headers },
      signal: AbortSignal.timeout(10000),
    });
    const raw = Buffer.from(await response.arrayBuffer());
    transcript.push({
      method: init.method ?? 'GET',
      route,
      status: response.status,
      response_sha256: sha(raw),
      at: new Date().toISOString(),
    });
    if (!response.ok)
      throw new Error(`ConjMap boundary ${response.status}: ${raw.toString().slice(0, 500)}`);
    return raw;
  }
  let task;
  try {
    gateway = launch(
      'python',
      [
        '-m',
        'mathforge.gateway',
        '--root',
        engineRoot,
        '--journal',
        engineJournal,
        '--port',
        String(enginePort),
        '--mode',
        'REAL_RUN',
        '--history-root',
        historyRoot,
        '--serve-seconds',
        '180',
      ],
      engineRoot,
      {
        ...common,
        PYTHONPATH: path.join(engineRoot, 'src'),
        PYTHONUTF8: '1',
        PYTHONDONTWRITEBYTECODE: '1',
        MATHFORGE_GATEWAY_TOKEN: secrets.gateway,
        MATHFORGE_RECEIPT_SECRET: secrets.callback,
      },
      folder,
      'gateway',
    );
    app = launch(
      process.execPath,
      [
        'node_modules/next/dist/bin/next',
        'start',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(appPort),
      ],
      root,
      {
        ...common,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        CONJMAP_MATHFORGE_URL: `http://127.0.0.1:${enginePort}/v2/`,
        CONJMAP_MATHFORGE_TOKEN: secrets.gateway,
        CONJMAP_CALLBACK_SECRET: secrets.callback,
        CONJMAP_RESEARCH_ACCESS_TOKEN: secrets.access,
        CONJMAP_REAL_TASK_DIR: taskDir,
        CONJMAP_TASK_DIR: path.join(folder, 'mock-unused'),
      },
      folder,
      'conjmap',
    );
    for (let i = 0; i < 100; i++) {
      if (gateway.exitCode !== null || app.exitCode !== null)
        throw new Error('Service exited before request; preserve local service logs');
      try {
        if ((await fetch(appUrl + '/problems/cm-000118', { signal: AbortSignal.timeout(1000) })).ok)
          break;
      } catch {
        /* startup only, no submission */
      }
      await delay(100);
      if (i === 99) throw new Error('ConjMap startup timeout; no research resubmission');
    }
    // Check the actual authenticated gateway is ready before the one allowed submission.
    let readiness;
    for (let i = 0; i < 100; i++) {
      if (gateway.exitCode !== null)
        throw new Error('Gateway exited before submission; inspect preserved logs');
      try {
        readiness = await fetch(`http://127.0.0.1:${enginePort}/v2/research-tasks/by-key/${key}`, {
          headers: { Authorization: `Bearer ${secrets.gateway}` },
          signal: AbortSignal.timeout(1000),
        });
        break;
      } catch {
        await delay(100);
      }
    }
    if (readiness?.status !== 404)
      throw new Error('Unexpected engine/key state; manual reconciliation required');
    const input = {
      problem_id: plan.problem_id,
      admission_id: plan.admission_id,
      objective:
        'Perform only the admitted source-bound Fin2 frequency calibration; no novelty or general conjecture claim.',
      budget: { wall_seconds: 30, max_tasks: 1, network: false },
    };
    await writeFile(path.join(folder, 'REQUEST.json'), JSON.stringify(input, null, 2), {
      flag: 'wx',
    });
    task = json(
      await api('/api/v2/research-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify(input),
      }),
    );
    await writeFile(path.join(folder, 'SUBMISSION.json'), JSON.stringify(task, null, 2), {
      flag: 'wx',
    });
    if (!task.engine_task_id && task.events.some((e) => e.kind === 'submission_uncertain'))
      task = json(await api(`/api/v2/research-tasks/${task.id}/reconcile`, { method: 'POST' }));
    if (!task.engine_task_id) throw new Error(`Engine did not admit task: ${task.blocker}`);
    for (let i = 0; i < 100 && ['queued', 'running'].includes(task.status); i++) {
      await delay(100);
      task = json(await api(`/api/v2/research-tasks/${task.id}/poll`, { method: 'POST' }));
    }
    if (!task.receipt || task.execution_mode !== 'REAL_RUN')
      throw new Error('No genuine engine receipt; do not claim integration');
    const payload = json(Buffer.from(task.receipt.payload));
    const signature =
      'sha256=' + createHmac('sha256', secrets.callback).update(task.receipt.payload).digest('hex');
    if (
      signature !== task.receipt.signature ||
      payload.engine_task_id !== task.engine_task_id ||
      payload.conjmap_task_id !== task.id ||
      payload.engine_commit !== plan.engine_commit
    )
      throw new Error('Driver receipt authentication/binding failed');
    const publicFolder = path.join(root, 'docs/evidence/v04-real-run', task.engine_task_id);
    await mkdir(publicFolder, { recursive: true });
    for (const artifact of payload.artifact_index) {
      const raw = await api(
        `/api/v2/research-tasks/${task.id}/artifacts/${encodeURIComponent(artifact.name)}`,
      );
      if (sha(raw) !== artifact.sha256 || raw.length !== artifact.bytes)
        throw new Error('Capture index mismatch');
      assertPublicEvidence(raw);
      await writeFile(path.join(publicFolder, artifact.name), raw, { flag: 'wx' });
    }
    task = json(await api(`/api/v2/research-tasks/${task.id}`));
    const rawTask = Buffer.from(JSON.stringify(task, null, 2));
    assertPublicEvidence(rawTask);
    await writeFile(path.join(publicFolder, 'CONJMAP_TASK.json'), rawTask, { flag: 'wx' });
    await writeFile(
      path.join(publicFolder, 'ENGINE_RECEIPT.json'),
      JSON.stringify(task.receipt, null, 2),
      { flag: 'wx' },
    );
    const summary = {
      ...plan,
      captured_at: new Date().toISOString(),
      status: task.status,
      real_engine_task_id: task.engine_task_id,
      conjmap_task_id: task.id,
      execution_mode: task.execution_mode,
      actual_research_runs: 1,
      receipt_verified_at_capture: true,
      mathematical_status: 'unknown',
      proof_kernel_verified: false,
      human_reviewed: false,
      resources: payload.resources,
      evidence: payload.artifact_index,
      engine_receipt_sha256: sha(Buffer.from(task.receipt.payload)),
      client_source_sha256: sha(await readFile(path.join(root, 'src/lib/real-research.ts'))),
      failure_or_retry: { submission_count: 1, automatic_replays: 0 },
      local_recovery: { run_id: uid, credentials_in_git: false },
    };
    await writeFile(
      path.join(publicFolder, 'TRANSPORT.json'),
      JSON.stringify(transcript, null, 2),
      { flag: 'wx' },
    );
    if (priorFailure)
      await writeFile(
        path.join(publicFolder, 'PRE_SUBMISSION_FAILURE.json'),
        JSON.stringify(priorFailure, null, 2),
        { flag: 'wx' },
      );
    await writeFile(path.join(publicFolder, 'SUMMARY.json'), JSON.stringify(summary, null, 2), {
      flag: 'wx',
    });
    await writeFile(
      path.join(folder, 'CAPTURE.json'),
      JSON.stringify(
        {
          publicFolder,
          task_id: task.id,
          engine_id: task.engine_task_id,
          appPort,
          enginePort,
          taskDir,
        },
        null,
        2,
      ),
      { flag: 'wx' },
    );
    if (task.status !== 'completed')
      throw new Error(`Actual task ${task.status}; retained genuine failure evidence, no retry`);
    // Real browser reads the persisted result, not a route fixture or simulated response.
    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(appUrl + '/problems/cm-000118');
      await page.getByLabel(/Local research access token/).fill(secrets.access);
      await page.getByRole('button', { name: 'Load real request history', exact: true }).click();
      await page.getByText('REAL ADAPTER · COMPLETED', { exact: true }).waitFor();
      await page.screenshot({
        path: path.join(publicFolder, 'browser-real-evidence.png'),
        fullPage: true,
      });
      await page.reload();
      await page.getByLabel(/Local research access token/).fill(secrets.access);
      await page.getByRole('button', { name: 'Load real request history', exact: true }).click();
      await page.getByText('REAL ADAPTER · COMPLETED', { exact: true }).waitFor();
      if (errors.length) throw new Error('Real evidence UI reported browser error');
      await writeFile(
        path.join(publicFolder, 'BROWSER_CHECK.json'),
        JSON.stringify(
          { persisted_after_reload: true, page_errors: errors, real_task_id: task.id },
          null,
          2,
        ),
        { flag: 'wx' },
      );
    } finally {
      await browser.close();
    }
    console.log(
      JSON.stringify({
        status: 'REAL_INTEGRATION_DONE',
        engine_task_id: task.engine_task_id,
        conjmap_task_id: task.id,
        engine_commit: plan.engine_commit,
        resources: payload.resources,
        evidence_path: path.relative(root, publicFolder).replaceAll('\\', '/'),
      }),
    );
  } catch (error) {
    await writeFile(
      path.join(folder, 'FAILURE.json'),
      JSON.stringify(
        {
          at: new Date().toISOString(),
          error: error.message,
          task_id: task?.id ?? null,
          no_automatic_retry: true,
          transcript,
        },
        null,
        2,
      ),
      { flag: 'wx' },
    );
    throw error;
  } finally {
    // Only processes created by this driver; never terminate a legacy controller.
    for (const process of [app, gateway]) if (process && process.exitCode === null) process.kill();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
