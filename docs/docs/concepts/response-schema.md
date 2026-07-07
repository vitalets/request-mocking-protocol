---
id: response-schema
title: Response Schema
slug: /concepts/response-schema
sidebar_position: 3
---

# Response Schema

The response schema is a serializable object that defines how to build the mocked response.

[Full response schema definition](https://github.com/vitalets/request-mocking-protocol/blob/main/src/protocol/response-schema.ts).

Example:

```js
{
  status: 200,
  body: 'Hello world'
}
```
