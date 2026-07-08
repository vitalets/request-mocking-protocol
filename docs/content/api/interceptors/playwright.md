---
id: playwright
title: Playwright
slug: /api/interceptors/playwright
sidebar_position: 3
---

# Playwright Interceptor

The Playwright interceptor is used to mock page requests with the same syntax as for server requests. It works **only with the Playwright test runner**. Use it for **client-side** interception of in-browser requests: 

```ts
import { setupPlaywrightInterceptor } from 'request-mocking-protocol/playwright';

await setupPlaywrightInterceptor(page, mockClient);
```

See [Playwright — Setup a custom fixture](/client-side-mocking/playwright#1-setup-a-custom-fixture) for an example of usage.
