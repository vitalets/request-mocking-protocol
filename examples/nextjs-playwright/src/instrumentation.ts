export async function register() {
  // Setup server-side fetch interception for E2E tests in non-production environments.
  // In the dev mode, this interception is not preserved across HMR reloads,
  // so you should additionally require it when starting the dev server:
  // NODE_OPTIONS='--require ./src/patch-fetch.js' next dev
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.VERCEL_ENV !== 'production') {
    await import('./patch-fetch.js');
  }
}
