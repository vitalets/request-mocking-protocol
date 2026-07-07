---
id: nextjs
title: Next.js
slug: /server-side/frameworks/nextjs
sidebar_position: 1
---

# Next.js

This guide shows how to enable server-side `fetch` interception in a Next.js App Router application, so that mocks defined in your tests are applied to the outgoing API calls.

The Next.js setup includes two parts.

## 1. Setup Instrumentation

Enable fetch interception in `instrumentation.ts` for normal server startup.

Create `src/patch-fetch.mjs` with the following content:

```js
// Patch fetch for testing.
// Keep this file as js to be able to import in the dev command.
import { setupFetchInterceptor } from 'request-mocking-protocol/fetch';

setupFetchInterceptor(async () => {
  const { headers } = await import('next/headers.js');
  return headers();
});
```

Import the patch in `src/instrumentation.ts` (adjust the env variable for your project):

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.VERCEL_ENV !== 'production') {
    await import('./patch-fetch.mjs');
  }
}
```

:::note
When deploying on Vercel, don't use `process.env.NODE_ENV` for detecting non-production environment,
because even preview deployments will have it as `production`.
:::

## 2. Adjust `next dev` command

Add interceptor to the `next dev` command, so it remains active across HMR reloads. Update `package.json`:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--import ./src/patch-fetch.mjs' next dev"
  }
}
```

:::tip
This `next dev` command import should become unnecessary once Next.js preserves the instrumented `fetch` across HMR automatically (see [#92877](https://github.com/vercel/next.js/issues/92877)).
:::

Now your Next.js server is ready for testing. Combine it with a test runner integration such as [Playwright](/docs/server-side/test-runners/playwright) or [Cypress](/docs/server-side/test-runners/cypress) to define mocks in your tests.

See the full working example in [`examples/nextjs-playwright`](https://github.com/vitalets/request-mocking-protocol/tree/main/examples/nextjs-playwright).
