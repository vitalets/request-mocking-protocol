---
id: fetch
title: Fetch
slug: /api/interceptors/fetch
sidebar_position: 1
---

# Fetch Interceptor

The Fetch interceptor overwrites the `globalThis.fetch` function to capture HTTP requests and apply mocks. It can be used for **both server-side and client-side** interception, wherever `fetch` is available.

Basic usage:

```ts
const { setupFetchInterceptor } = await import('request-mocking-protocol/fetch');

setupFetchInterceptor(() => {
  // read and return headers of the incoming HTTP request
});
```

The actual function for retrieving incoming headers depends on the application framework.

For a complete example, see the [server-side Next.js integration](/docs/server-side-mocking/frameworks/nextjs) on how to use this interceptor.
