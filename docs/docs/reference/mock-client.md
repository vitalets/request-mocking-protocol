---
id: mock-client
title: MockClient
slug: /reference/mock-client
sidebar_position: 1
---

# MockClient

The `MockClient` class is used on the test-runner side to define HTTP request mocks.

## Constructor

### `constructor(options?: MockClientOptions)`

Creates a new instance of `MockClient`.

- `options` (optional): An object containing configuration options.
  - `debug` (optional): A boolean indicating whether to enable debug mode.

## Properties

### `headers: Record<string, string>`

Returns HTTP headers that are built from the mock schemas. Should be sent to the server for mocking server-side requests.

### `onChange?: (headers: Record<string, string>) => void`

A callback function that is called whenever the mocks are changed. Accepts `headers` parameter that can be attached to the browsing context and send to the server.

## Methods

### `async addMock(reqSchema, resSchema): Promise<void>`
### `async GET(reqSchema, resSchema): Promise<void>`
### `async POST(reqSchema, resSchema): Promise<void>`
### `async PUT(reqSchema, resSchema): Promise<void>`
### `async PATCH(reqSchema, resSchema): Promise<void>`
### `async DELETE(reqSchema, resSchema): Promise<void>`
### `async HEAD(reqSchema, resSchema): Promise<void>`
### `async ALL(reqSchema, resSchema): Promise<void>`

Adds a new mock for the corresponding HTTP method.

If multiple mocks match the same request, the most recently added matching mock is used. Mock precedence is based on registration order, not URL specificity.

- `reqSchema: string | RegExp | object` – The request matching schema for the mock.
    - If defined as `string`, it is treated as [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) for matching the request only by URL. A URL string without an explicit search component matches any query string.
    - If defined as `RegExp`, it is treated as [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) for matching the request only by URL.
    - If defined as `object`, it is treated as [MockRequestSchemaInit](https://github.com/vitalets/request-mocking-protocol/blob/main/src/protocol/request-schema.ts) type.

- `resSchema: number | object`: The response schema for the mock.
    - If defined as `number`, it is treated as an HTTP status code.
    - If defined as `object`, it is treated as [MockResponseSchema](https://github.com/vitalets/request-mocking-protocol/blob/main/src/protocol/response-schema.ts) type.

Examples:

```ts
// mock any GET request to https://example.com
await mockClient.GET('https://example.com/*', {
  body: {
    id: 1,
    name: 'John Smith'
  },
});

// mock any POST request to https://example.com having foo=bar in query
await mockClient.POST({
  url: 'https://example.com/*',
  query: {
    foo: 'bar'
  },
}, {
  body: {
    id: 1,
    name: 'John Smith'
  },
});
```

### `async reset(): Promise<void>`

Clears all mocks and rebuilds the headers.
