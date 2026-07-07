---
id: response-mocking
title: Response Mocking
slug: /guides/response-mocking
sidebar_position: 2
---

# Response Mocking

RMP lets you mock any part of the response.

## Body

Set response body as string or JSON object:

```ts
// string
await mockClient.GET(/* req */, {
  body: 'Hello world'
});

// JSON
await mockClient.GET(/* req */, {
  body: { 
    id: 1, 
    name: 'John Smith' 
  },
});
```

## Headers

Set response headers:

```ts
await mockClient.GET(/* req */, {
  headers: { 
    'content-type': 'application/json' 
  },
});
```

## Status Code

Set arbitrary HTTP status code to emulate errors:

```ts
// Emulate 500 Internal Server Error
await mockClient.GET(/* req */, 500);

// or with full syntax
await mockClient.GET(/* req */, {
  status: 500
});
```

## Delay

Set arbitrary response delay in miliseconds:

```ts
await mockClient.GET(/* req */, {
  delay: 1000
});
```

## Combination

You can combine all options together to build the response mock:

```ts
await mockClient.GET('https://example.com/*', {
  headers: { 
    'content-type': 'application/json' 
  },
  body: { 
    id: 1, 
    name: 'John Smith' 
  },
  delay: 1000,
});
```
