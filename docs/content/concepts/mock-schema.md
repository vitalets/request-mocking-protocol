---
id: mock-schema
title: Mock Schema
slug: /concepts/mock-schema
sidebar_position: 1
---

# Mock Schema

A mock schema is a serializable object that describes one HTTP mock. It consists of a [`reqSchema`](/docs/concepts/request-schema), which defines the request to match, and a [`resSchema`](/docs/concepts/response-schema), which defines the mocked response to return.

Example:

```js
{
  reqSchema: {
    method: 'GET',
    url: 'https://example.com',
  },
  resSchema: {
    status: 200,
    body: 'Hello world',
  }
}
```

This schema will match the request:
```
GET https://example.com
```

and make it return the response:
```
HTTP 200 OK
Hello world
```

See the [Request Schema](/docs/concepts/request-schema) and [Response Schema](/docs/concepts/response-schema) pages for the full set of available options.
