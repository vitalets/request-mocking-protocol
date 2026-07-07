---
id: playwright
title: Playwright
slug: /integrations/playwright
sidebar_position: 1
---

# Playwright

This guide shows how to define server-side mocks in Playwright tests. Mocks are sent to the app server through Playwright's browser context headers.

Each test defines its own mocks using a [`MockClient`](/docs/reference/mock-client) class. Mocks are not shared across tests, enabling **per-test mock isolation** and **full parallelization**.

## 1. Setup a custom fixture `mockServerRequest`

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

## 2. Use `mockServerRequest` in test to define server-side mocks

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

This integration requires a framework interceptor on the server side. See the [Next.js App Router](/docs/integrations/nextjs) guide for a complete setup.

See the full working example in [`examples/nextjs-playwright`](https://github.com/vitalets/request-mocking-protocol/tree/main/examples/nextjs-playwright).
