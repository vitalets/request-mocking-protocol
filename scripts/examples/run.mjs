/**
 * Script to programmatically run all examples.
 * Not used now as it's tricky to start/stop app servers programmatically.
 */
import { execSync } from 'child_process';
import { startProcess, stopProcess } from './launcher.mjs';

runNextjsPlaywright();

async function runNextjsPlaywright() {
  const cwd = 'examples/nextjs-playwright';
  const app = await startProcess('npm', ['run', 'dev'], 'Ready in', cwd);
  try {
    execSync('npm test', { stdio: 'inherit', cwd });
  } finally {
    await stopProcess(app);
  }
}

// cd examples/nextjs-playwright
// npm t

// cd ../astro-cypress

// rm -rf examples/node_modules/request-mocking-protocol
// mkdir -p examples/node_modules/request-mocking-protocol
// cp -R ./dist examples/node_modules/request-mocking-protocol/
// cp ./package.json examples/node_modules/request-mocking-protocol/package.json
