export async function register() {
  // Setup server-side fetch interception for E2E tests in non-production environments.
  // In the dev mode, this interception is not preserved across HMR reloads,
  // so you should additionally import it in the dev command:
  // NODE_OPTIONS='--import ./src/patch-fetch.mjs' next dev
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.VERCEL_ENV !== 'production') {
    await import('./patch-fetch.mjs');
  }
}
