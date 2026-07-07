---
id: custom-test-runner
title: Custom Test Runner
slug: /integrations/custom-test-runner
sidebar_position: 5
---

# Custom Test Runner

You can integrate RMP with any test runner. It requires two steps:

1. Use the [`MockClient`](/docs/reference/mock-client) class to define mocks.
   ```js
   const mockClient = new MockClient();
   ```

2. Attach [`mockClient.headers`](/docs/reference/mock-client#headers-recordstring-string) to the navigation request.
   ```js
   const headers = {
    ...mockClient.headers
   };
   // ...navigate to the page with provided headers
   ```
