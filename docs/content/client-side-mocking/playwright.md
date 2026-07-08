---
id: playwright
title: Playwright
slug: /client-side-mocking/playwright
sidebar_position: 2
---

# Playwright

You can mock requests made **in the browser** with the same syntax as [server-side mocks](/server-side-mocking/test-runners/playwright). Browser requests are intercepted directly by Playwright, so no framework interceptor is required.

## 1. Setup a custom fixture

Extend the base Playwright `test` with a `mockBrowserRequest` fixture. It creates a [`MockClient`](/api/mock-client) and wires it to the browser context via `setupPlaywrightInterceptor`, which registers the request interception. Exposing it as a fixture gives each test its own isolated `MockClient` instance, so mocks never leak between tests.

```ts
import { test as base } from '@playwright/test';
import { MockClient } from 'request-mocking-protocol';
import { setupPlaywrightInterceptor } from 'request-mocking-protocol/playwright';

export const test = base.extend<{ mockBrowserRequest: MockClient }>({
  mockBrowserRequest: async ({ context }, use) => {
    const mockClient = new MockClient();
    await setupPlaywrightInterceptor(context, mockClient);
    await use(mockClient);
  },
});
```

## 2. Define and apply mocks

Use the `mockBrowserRequest` fixture inside a test to declare mocks. Define them **before** navigating so they are active when the page fires its requests. Once set up, any matching browser request is intercepted and served the mocked response, letting you assert the resulting UI state.

```ts
test('my test', async ({ page, mockBrowserRequest }) => {
  // set up browser-side mock
  await mockBrowserRequest.GET('https://jsonplaceholder.typicode.com/users', {
    body: [{ id: 1, name: 'John Smith' }],
  });

  // navigate to the page
  await page.goto('/');

  // assert page content according to mock
  await expect(page).toContainText('John Smith');
});
```

To mock requests made by the app server instead, see [Playwright — Server-Side Mocks](/server-side-mocking/test-runners/playwright).
