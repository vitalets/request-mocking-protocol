---
id: custom
title: Custom
slug: /server-side-mocking/test-runners/custom
sidebar_position: 3
---

# Custom Test Runner

You can integrate RMP with any test runner. It requires two steps:

1. Use the [`MockClient`](/api/mock-client) class to define mocks.
   ```js
   const mockClient = new MockClient();
   ```

2. Attach [`mockClient.headers`](/api/mock-client#headers) to the navigation request.
   ```js
   const headers = {
    ...mockClient.headers
   };
   // ...navigate to the page with provided headers
   ```
