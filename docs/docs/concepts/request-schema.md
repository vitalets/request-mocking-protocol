---
id: request-schema
title: Request Schema
slug: /concepts/request-schema
sidebar_position: 2
---

# Request Schema

The request schema is a serializable object that defines parameters for matching a request.

[Full request schema definition](https://github.com/vitalets/request-mocking-protocol/blob/main/src/protocol/request-schema.ts).

Example:

```js
{
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/users',
  query: {
    foo: 'bar'
  }
}
```

This schema will match the request:

```
GET https://jsonplaceholder.typicode.com/users?foo=bar
```
