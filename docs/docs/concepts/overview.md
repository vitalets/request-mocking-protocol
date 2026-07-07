---
id: overview
title: Concepts
slug: /concepts/overview
sidebar_position: 1
---

# Concepts

## Mock Schema

A mock schema is a serializable object that describes one HTTP mock. It consists of a `reqSchema`, which defines the request to match, and a `resSchema`, which defines the mocked response to return.

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

## Request Schema

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

## Response Schema

The response schema is a serializable object that defines how to build the mocked response.

[Full response schema definition](https://github.com/vitalets/request-mocking-protocol/blob/main/src/protocol/response-schema.ts).

Example:

```js
{
  status: 200,
  body: 'Hello world'
}
```

## Transport

Request-mocking-protocol uses a custom HTTP header `x-mock-request` for transferring JSON-stringified schemas from the test runner to the application server.

Example:

```
x-mock-request: [{"reqSchema":{"method":"GET","patternType":"urlpattern","url":"https://example.com"},"resSchema":{"body":"hello","status":200}}]
```

On the server side, the interceptor will read the incoming headers and apply the mocks.
