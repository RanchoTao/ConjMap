import { existsSync } from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
// A fresh checkout starts with one command; install exactly the lockfile once.
if (!existsSync('node_modules/next/package.json')) {
  const install = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (install.status !== 0) process.exit(install.status ?? 1);
}
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code) => process.exit(code ?? 0));
