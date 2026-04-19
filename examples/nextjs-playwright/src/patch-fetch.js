/**
 * Setup fetch interception for E2E tests.
 * This file is used in two places:
 * 1) In dev mode, it's required in the NODE_OPTIONS when starting the dev server.
 * 2) In non-dev mode, it's imported in the instrumentation.ts file.
 */
import { setupFetchInterceptor } from 'request-mocking-protocol/fetch';

setupFetchInterceptor(async () => {
  const { headers } = await import('next/headers.js');
  return headers();
});
