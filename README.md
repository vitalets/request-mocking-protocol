# Request Mocking Protocol

[![lint](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/request-mocking-protocol)](https://www.npmjs.com/package/request-mocking-protocol)
[![license](https://img.shields.io/npm/l/request-mocking-protocol)](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)

Request Mocking Protocol (RMP) is an open standard for declarative mocking of HTTP requests.
It defines JSON schemas for catching a request and building a response. 
The schemas can be serialized and passed over the wire, allowing server-side API calls to be mocked (e.g., in React Server Components).

## Index

<details>
<summary>Click to expand</summary>

<!-- doc-gen TOC maxDepth="3" excludeText="Index" -->
- [How it works](#how-it-works)
- [Installation](#installation)
- [Test-runner Integration](#test-runner-integration)
  - [Playwright](#playwright)
  - [Cypress](#cypress)
  - [Custom](#custom)
- [Framework Integration](#framework-integration)
  - [Next.js](#nextjs)
  - [Astro](#astro)
  - [Custom](#custom-1)
- [Parameters Substitution](#parameters-substitution)
- [Concepts](#concepts)
  - [Request Schema](#request-schema)
  - [Response Schema](#response-schema)
  - [Transport](#transport)
- [API](#api)
  - [MockClient](#mockclient)
  - [Interceptors](#interceptors)
- [License](#license)
<!-- end-doc-gen -->

</details>

## How it works

```mermaid
flowchart LR;
    A(Test Runner) -- "x-mock-request:<br><code style='font-size: 0.8em;padding: 0 10px'>{url:#quot;http:\/\/external/api#quot;,body:#quot;Hello#quot;}</code></span>" --> B(App Server);
    B -- &lt;h1&gt;Hello&lt;/h1&gt; --> A;
    B -. Mocked! .-> C(External API);
    C -.-> B;
```    

1. The test runner defines a mock as a request and response in JSON format.
2. When a webpage is opened, the mock is attached to the navigation request as a custom HTTP header.
3. The application server reads the mock header and applies the mocks to outgoing API calls.
4. The page is rendered with data from the mocked response.

Check out the [Concepts](#concepts) for more details.

## Installation
```
npm i -D request-mocking-protocol
```

## Test-runner Integration

On the test-runner side, you can define server-side mocks via the `MockClient` class.

### Playwright

1. Set up the `mockServerRequest` fixture:
    ```ts
    import { test as base } from '@playwright/test';
    import { MockClient } from 'request-mocking-protocol';

    export const test = base.extend<{ mockServerRequest: MockClient }>({
      mockServerRequest: async ({ context }, use) => {
        const mockClient = new MockClient();
        mockClient.onChange = async (headers) => context.setExtraHTTPHeaders(headers);
        await use(mockClient);
      },
    });
    ```

2. Use the `mockServerRequest` fixture to define server-side request mocks:
    ```ts
    test('my test', async ({ page, mockServerRequest }) => {
      await mockServerRequest.GET('https://jsonplaceholder.typicode.com/users', {
        body: [{ id: 1, name: 'John Smith' }],
      });

      // ...
    });
    ```

### Cypress

1. Add a custom command `mockServerRequest` in support files, see example [mock-server-request.js](examples/astro-cypress/cypress/support/mock-server-request.js).

2. Use the custom command to define mocks:
    ```js
    it('shows list of users', () => {
      cy.mockServerRequest('https://jsonplaceholder.typicode.com/users', {
        body: [{ id: 1, name: 'John Smith' }],
      });

      // ...
    });
    ```

### Custom

You can integrate RMP with any test runner. It requires two steps:

1. Use the `MockClient` class to define mocks.
2. Attach `mockClient.headers` to the navigation request.

## Framework Integration

On the server side, you should set up an interceptor to catch the requests and apply your mocks.

### Next.js

Add the following code to the [instrumentation.ts](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation) file:
```ts
// instrumentation.ts
import { headers } from 'next/headers';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
    const { setupFetchInterceptor } = await import('request-mocking-protocol/fetch');
    setupFetchInterceptor(() => headers());
  }
}
```

> Note that you need to dynamically import the interceptor inside `process.env.NEXT_RUNTIME = 'nodejs'`. 

### Astro
See [astro.config.ts](examples/astro-cypress/astro.config.ts) in the astro-cypress example.

### Custom

You can write an interceptor for any framework. It requires two steps:

1. Read the HTTP headers of the incoming request.
2. Capture outgoing HTTP requests.

Check out the reference implementations in the [src/interceptors](src/interceptors) directory.

## Parameters Substitution

You can define route parameters in the URL pattern and use them in the response:

```ts
await mockClient.GET('https://jsonplaceholder.typicode.com/users/:id', {
  body: {
    id: '{{ id:number }}',
    name: 'User {{ id }}',
  }
});
```

The request: 
```
GET https://jsonplaceholder.typicode.com/users/1
```
will be mocked with the response:
```js
{
  id: 1,
  name: 'User 1',
}
```

## Concepts

### Request Schema

The request schema is a serializable object that defines parameters for matching a request.

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

[Full schema definition.](src/protocol/request-schema.ts)

### Response Schema

The response schema is a serializable object that defines how to build the mocked response.

Example:
```js
{
  status: 200,
  body: 'Hello world'
}
```

[Full schema definition.](src/protocol/response-schema.ts)

### Transport

Request-mocking-protocol uses a custom HTTP header `x-mock-request` for transferring JSON-stringified schemas from the test runner to the application server.

Example:
```
x-mock-request: [{"reqSchema":{"method":"GET","patternType":"urlpattern","url":"https://example.com"},"resSchema":{"body":"hello","status":200}}]
```

On the server side, the interceptor will read the incoming headers and apply the mocks.

## API

### MockClient

The `MockClient` class is used on the test-runner side to define HTTP request mocks.

#### Constructor

##### `constructor(options?: MockClientOptions)`

Creates a new instance of `MockClient`.

- `options` (optional): An object containing configuration options.
  - `debug` (optional): A boolean indicating whether to enable debug mode.
  - `defaultMethod` (optional): The default HTTP method to use for requests.

#### Properties

##### `headers: Record<string, string>`

Returns HTTP headers that are built from the mock schemas. Can be sent to the server for mocking server-side requests.

##### `onChange?: (headers: Record<string, string>) => void`

A callback function that is called whenever the mocks are changed.

#### Methods

##### `async addMock(reqSchema, resSchema): Promise<void>`
##### `async GET(reqSchema, resSchema): Promise<void>`
##### `async POST(reqSchema, resSchema): Promise<void>`
##### `async PUT(reqSchema, resSchema): Promise<void>`
##### `async DELETE(reqSchema, resSchema): Promise<void>`
##### `async HEAD(reqSchema, resSchema): Promise<void>`
##### `async ALL(reqSchema, resSchema): Promise<void>`

Adds a new mock for the corresponding HTTP method.

- `reqSchema: string | RegExp | object` – The [request schema](src/protocol/request-schema.ts) for the mock. If defined as `string | RegExp`, it is treated as [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) or [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) for matching the request only by URL.
- `resSchema: number | object`: The [response schema](src/protocol/response-schema.ts) for the mock. If defined as `number`, it is treated as an HTTP status code.

##### `async reset(): Promise<void>`

Clears all mocks and rebuilds the headers.

### Interceptors

Interceptors are used on the server to capture HTTP requests and apply mocks.
Currently, there are two interceptors available.

#### Fetch

This interceptor overwrites the `globalThis.fetch` function.

Basic usage:
```ts
const { setupFetchInterceptor } = await import('request-mocking-protocol/fetch');

setupFetchInterceptor(() => { 
  // read and return headers of the incoming HTTP request
});
```
The actual function for retrieving incoming headers depends on the application framework. 

#### MSW

You can use [MSW](https://mswjs.io/docs/integrations/node) to intercept server-side requests:

```ts
import { setupServer } from 'msw/node';
import { createHandler } from 'request-mocking-protocol/msw';

const mockHandler = createHandler(() => { 
  // read and return headers of the incoming HTTP request
});
const mswServer = setupServer(mockHandler);
mswServer.listen();
```

The actual function for retrieving incoming headers depends on the application framework. 

## License
[MIT](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)