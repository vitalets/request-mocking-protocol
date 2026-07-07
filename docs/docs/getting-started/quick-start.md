---
id: quick-start
title: 'Quick Start: Next.js + Playwright'
slug: /getting-started/quick-start
sidebar_position: 3
---

# Quick Start: Next.js + Playwright

This setup mocks server-side `fetch` calls made by a Next.js app during Playwright tests.

## Setup Interception in Next.js

The Next.js setup includes two parts.

### 1. Setup Instrumentation

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

### 2. Adjust `next dev` command

Add interceptor to the `next dev` command, so it remains active across HMR reloads. Update `package.json`:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--import ./src/patch-fetch.mjs' next dev"
  }
}
```

:::caution
This `next dev` command import should become unnecessary once Next.js preserves the instrumented `fetch` across HMR automatically (see [#92877](https://github.com/vercel/next.js/issues/92877)).
:::

:::caution
Placing the fetch interceptor in `layout.tsx` is no longer recommended.
:::

Now your Next.js server is ready for testing.

## Setup `MockClient` in Playwright

Each test defines its own mocks using a [`MockClient`](/docs/reference/mock-client) class. Mocks are not shared across tests, enabling **per-test mock isolation** and **full parallelization**.

### 1. Setup a custom fixture `mockServerRequest`

```ts
import { test as base } from '@playwright/test';
import { MockClient } from 'request-mocking-protocol';

export const test = base.extend<{ mockServerRequest: MockClient }>({
  mockServerRequest: async ({ context }, use) => {
    const mockClient = new MockClient();
    mockClient.onChange = async (headers) => context.setExtraHTTPHeaders(headers);
    await use(mockClient);
  },
});
```

### 2. Use `mockServerRequest` in test to define server-side mocks

```ts
test('my test', async ({ page, mockServerRequest }) => {
  // set up server-side mock
  await mockServerRequest.GET('https://jsonplaceholder.typicode.com/users', {
    body: [{ id: 1, name: 'John Smith' }],
  });

  // navigate to the page
  await page.goto('/');

  // assert page content according to mock
  await expect(page).toContainText('John Smith');
});
```

Check out [`MockClient`](/docs/reference/mock-client) API for other methods.

See the full working example in [`examples/nextjs-playwright`](https://github.com/vitalets/request-mocking-protocol/tree/main/examples/nextjs-playwright).
