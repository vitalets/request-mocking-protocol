---
id: debugging
title: Debugging
slug: /writing-mocks/debugging
sidebar_position: 6
---

# Debugging

You can enable debugging in two ways:

- set `REQUEST_MOCKING_DEBUG=1` env variable to debug all mocks
- set `debug: true` on any request/response schema to debug the specific mock

```ts
await mockClient.GET(
  {
    url: 'https://example.com/*',
    query: { foo: 'bar' },
    debug: true, // <-- enable debugging via request schema
  },
  {
    body: { id: 1, name: 'John Smith' },
    debug: true, // <-- or enable debugging via response schema
  },
);
```

When debug enabled, the server will output mocking logs to console:

![Debug logs](/img/debug.png)
