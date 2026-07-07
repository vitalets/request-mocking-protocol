---
id: interceptors
title: Interceptors
slug: /reference/interceptors
sidebar_position: 2
---

# Interceptors

Interceptors are used on the server to capture HTTP requests and apply mocks.
Currently, there are two server-side interceptors available.

## Global Fetch

This interceptor overwrites the `globalThis.fetch` function.

Basic usage:

```ts
const { setupFetchInterceptor } = await import('request-mocking-protocol/fetch');

setupFetchInterceptor(() => {
  // read and return headers of the incoming HTTP request
});
```

The actual function for retrieving incoming headers depends on the application framework.

## MSW Interceptor

If your app doesn’t use `fetch`, you can try the [MSW](https://mswjs.io/docs/integrations/node) interceptor, which can capture a broader range of request types:

```ts
import { setupServer } from 'msw/node';
import { createHandler } from 'request-mocking-protocol/msw';

const mockHandler = createHandler(() => {
  // read and return headers of the incoming HTTP request
});
const mswServer = setupServer(mockHandler);
mswServer.listen();
```

> Note that MSW is used **only** to capture the request, while the mocks should be declaratively defined using the [MockClient](/docs/reference/mock-client) class.

The function for retrieving incoming HTTP headers depends on the application framework.
For **Next.js**, use the [`instrumentation.ts` setup](/docs/getting-started/quick-start#setup-interception-in-nextjs) instead of `layout.tsx`.

## Playwright Interceptor

The Playwright interceptor is used in Playwright tests to mock page requests with the same syntax as for server requests.

```ts
import { setupPlaywrightInterceptor } from 'request-mocking-protocol/playwright';

await setupPlaywrightInterceptor(page, mockClient);
```

Use it for in-browser requests. For server-side requests in Next.js, use the [`Global Fetch`](#global-fetch) interceptor through the [quick start setup](/docs/getting-started/quick-start).
