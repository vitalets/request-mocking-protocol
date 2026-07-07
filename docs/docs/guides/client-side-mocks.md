---
id: client-side-mocks
title: Client-Side Mocks
slug: /guides/client-side-mocks
sidebar_position: 5
---

# Client-Side Mocks

You can mock client-side requests with the same syntax as server-side mocks. 
To achieve it in Playwright, create a `mockBrowserRequest` fixture:

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

Then use it in tests:
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
