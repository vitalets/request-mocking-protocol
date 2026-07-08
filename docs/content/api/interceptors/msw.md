---
id: msw
title: MSW
slug: /api/interceptors/msw
sidebar_position: 2
---

# MSW Interceptor

If your app doesn’t use `fetch`, you can try the [MSW](https://mswjs.io/docs/integrations/node) interceptor, which can capture a broader range of request types. It can be used for **both server-side and client-side** interception.

```ts
import { setupServer } from 'msw/node';
import { createHandler } from 'request-mocking-protocol/msw';

const mockHandler = createHandler(() => {
  // read and return headers of the incoming HTTP request
});
const mswServer = setupServer(mockHandler);
mswServer.listen();
```

> Note that MSW is used **only** to capture the request, while the mocks should be declaratively defined using the [MockClient](/api/mock-client) class.

The function for retrieving incoming HTTP headers depends on the application framework.
