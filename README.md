# Request Mocking Protocol

[![lint](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/request-mocking-protocol)](https://www.npmjs.com/package/request-mocking-protocol)
[![license](https://img.shields.io/npm/l/request-mocking-protocol)](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)

**Request Mocking Protocol (RMP)** is a specification for declarative mocking of HTTP requests. It uses JSON schemas to define request matchers and response builders. These schemas can be serialized and sent over the network, enabling both *client-side* and *server-side* mocking (e.g., in React Server Components).

## How it works

![How RMP works](https://raw.githubusercontent.com/vitalets/request-mocking-protocol/refs/heads/main/scripts/img/rmp-schema.png)

1. The test runner defines a request mock as a JSON object.
2. The mock is sent with the page navigation via a custom HTTP header.
3. The server reads the header and applies the mock to outgoing API requests.
4. The page loads with data from the mocked response.

Check out the [Concepts](#concepts) and [Limitations](#limitations) for more details.

## Index
<details>
<summary>Click to expand</summary>

<!-- doc-gen TOC maxDepth="3" excludeText="Index" -->
- [Index](#index)
- [Features](#features)
- [How it works](#how-it-works)
- [Installation](#installation)
- [Test-runner Integration](#test-runner-integration)
  - [Playwright](#playwright)
  - [Cypress](#cypress)
  - [Custom](#custom)
- [Framework Integration](#framework-integration)
  - [Next.js (App router)](#nextjs-app-router)
  - [Astro](#astro)
  - [Custom](#custom-1)
- [Request Matching](#request-matching)
- [Parameter Substitution](#parameter-substitution)
- [Response Patching](#response-patching)
- [Debugging](#debugging)
- [Concepts](#concepts)
  - [Request Schema](#request-schema)
  - [Response Schema](#response-schema)
  - [Transport](#transport)
- [Limitations](#limitations)
- [API](#api)
  - [MockClient](#mockclient)
  - [Interceptors](#interceptors)
- [Comparison with MSW](#comparison-with-msw)
- [License](#license)
<!-- end-doc-gen -->

</details>

## Features

* [**Server-side mocking**](#how-it-works) – Transmit mocks via a custom HTTP header to apply them on the server.
* [**Per-test isolation**](#test-runner-integration) – Define mocks inside each test, enabling full parallel test execution.
* [**Test runner support**](#test-runner-integration) – Works with **Playwright**, **Cypress**, and custom runners.
* [**Framework-agnostic**](#framework-integration) – Built-in support for **Next.js** and **Astro**, or integrate with any framework.
* [**Request matching**](#request-matching) – Match requests by URL, wildcard, query, headers, or body.
* [**Response patching**](#response-patching) – Fetch real API responses and override only what’s needed.
* [**Dynamic parameters**](#parameter-substitution) – Use `{{ }}` placeholders to inject route/query values into responses.
* [**Mocks API**](#api) – Set up mocks easily using a `MockClient` class.
* [**Debug-friendly**](#debugging) – Add `debug: true` for detailed breakdown of the mocking process.

## Installation
```
npm i -D request-mocking-protocol
```

## Test-runner Integration

RMP is designed to work seamlessly with popular test runners like Playwright and Cypress, and can also be integrated with custom runners.

Each test defines its own mocks using a [`MockClient`](#mockclient) class. Mocks are not shared across tests, enabling **per-test mock isolation** and **full parallelization**.

### Playwright

1. Set up a custom fixture `mockServerRequest`:
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

2. Use `mockServerRequest` in test to define server-side mocks:
    ```ts
    test('my test', async ({ page, mockServerRequest }) => {
      // set up server-side mock
      await mockServerRequest.GET('https://jsonplaceholder.typicode.com/users', {
        body: [{ id: 1, name: 'John Smith' }],
      });

      // navigate to the page
      await page.goto('/');

      // assert page content according to mock
      await expect(page).toContainText('John Smith');
    });
    ```

Check out [`MockClient`](#mockclient) API for other methods.

### Cypress

1. Add a custom command `mockServerRequest` in support files, see example [mock-server-request.js](examples/astro-cypress/cypress/support/mock-server-request.js).

2. Use the custom command to define mocks:
    ```js
    it('shows list of users', () => {
      // set up server-side mock
      cy.mockServerRequest('https://jsonplaceholder.typicode.com/users', {
        body: [{ id: 1, name: 'John Smith' }],
      });

      // navigate to the page
      cy.visit('/');

      // assert page content according to mock
      cy.get('li').first().should('have.text', 'John Smith');
    });
    ```

### Custom

You can integrate RMP with any test runner. It requires two steps:

1. Use the `MockClient` class to define mocks.
2. Attach `mockClient.headers` to the navigation request.

## Framework Integration

On the server side, you should set up an [interceptor](#interceptors) to catch the requests and apply your mocks.

### Next.js (App router)

Add the following code to the top level `layout.tsx`:
```ts
// app/layout.tsx
import { headers } from 'next/headers';

if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
  const { setupFetchInterceptor } = await import('request-mocking-protocol/fetch');
  setupFetchInterceptor(() => headers());
}

// ...
```

> [!NOTE]
> Apply interceptor only in `nodejs` runtime.

> [!IMPORTANT]
> Don't load interceptor inside [instrumentation.ts](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation), as it will be cleared in dev server after re-compilation.

### Astro
See [astro.config.ts](examples/astro-cypress/astro.config.ts) in the astro-cypress example.

### Custom

You can write an interceptor for any framework. It requires two steps:

1. Read the HTTP headers of the incoming request.
2. Capture outgoing HTTP requests.

Check out the reference implementations in the [src/interceptors](src/interceptors) directory.

## Request Matching

RMP offers flexible matching options to ensure your mocks are applied exactly when you need them:

- **Exact URL matching**: Match requests by providing a full URL string.
  ```ts
  await mockClient.GET('https://api.example.com/users', { body: [] });
  ```

- **Wildcard matching**: Use wildcards with [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)-style syntax.
  ```ts
  await mockClient.GET('https://api.example.com/users/*', { body: [] });
  ```

- **Regular expression matching**: Match requests using JavaScript regular expressions.
  ```ts
  await mockClient.GET(/\/users\/\d+$/, { body: {} });
  ```

- **Query parameter matching**: Match specific query parameters for more targeted mocks.
  ```ts
  await mockClient.GET({
    url: 'https://api.example.com/users',
    query: { role: 'admin' },
  }, { body: [] });
  ```

- **Method-based matching**: Explicitly define the HTTP method (`GET`, `POST`, etc.) to avoid accidental matches.
  ```ts
  await mockClient.POST('https://api.example.com/users', { status: 201 });
  ```

- **Schema matching**: Use full request schemas to match by method, URL, query, and optionally enable `debug` mode for inspection.
  ```ts
  await mockClient.GET({
    method: 'GET',
    url: 'https://api.example.com/users',
    query: { active: 'true' },
    debug: true,
  }, { body: [] });
  ```

## Parameter Substitution

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

## Response Patching

Response patching allows to make a real request, but modify parts of the response for the testing purposes.
RMP supports response patching by providing the `bodyPatch` key in the response schema:

```ts
await mockClient.GET('https://jsonplaceholder.typicode.com/users', {
  bodyPatch: {
    '[0].address.city': 'New York',
  },
});
```
The final response will contain actual and modified data:
```diff
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "address": {
-      "city": "Gwenborough",
+      "city": "New York",
      ...
    }
  }
  ...
]    
```
This technique is particularly useful to keep your tests in sync with actual API responses, while maintaining test stability and logic.

The `bodyPatch` contains object in a form:
```
{
  [path.to.property]: new value
}
```
`path.to.property` uses dot-notation, evaluated with [lodash.set](https://lodash.com/docs/4.17.15#set).

## Debugging

You can debug the mocking process by providing `debug: true` option to either request or response schema:

```ts
await mockClient.GET(
  {
    url: 'https://jsonplaceholder.typicode.com/users',
    query: {
      foo: 'bar',
    },
    debug: true, // <-- use debugging
  },
  {
    body: [{ id: 1, name: 'John Smith' }],
  },
);
```
When applying this mock, the server console with output the following:

<img width="661" alt="Image" src="https://github.com/user-attachments/assets/b861ddc2-ebee-41fd-911f-ef37330a5854" />

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

## Limitations

1. **Static Data Only:** The mock must be serializable to JSON. This means you can't provide arbitrary function-based mocks. To mitigate this restriction, RMP supports [Parameter Substitution](#parameter-substitution) and [Response Patching](#response-patching) techniques.

2. **Header Size Limits:** HTTP headers typically support 4KB to 8KB of data. This approach is best suited for small payloads.

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

- `reqSchema: string | RegExp | object` – The [request schema](src/protocol/request-schema.ts) for the mock.
    - If defined as `string`, it is treated as [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) for matching the request only by URL.
    - If defined as `RegExp`, it is treated as [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) for matching the request only by URL.

- `resSchema: number | object`: The [response schema](src/protocol/response-schema.ts) for the mock.
    - If defined as `number`, it is treated as an HTTP status code.

Examples:
```ts
// mock any GET request to https://example.com
await mockServerRequest.GET('https://example.com/*', {
  body: { 
    id: 1, 
    name: 'John Smith' 
  },
});

// mock any POST request to https://example.com having foo=bar in query
await mockServerRequest.POST({
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

##### `async reset(): Promise<void>`

Clears all mocks and rebuilds the headers.

### Interceptors

Interceptors are used on the server to capture HTTP requests and apply mocks.
Currently, there are two interceptors available.

#### Global Fetch

This interceptor overwrites the `globalThis.fetch` function.

Basic usage:
```ts
const { setupFetchInterceptor } = await import('request-mocking-protocol/fetch');

setupFetchInterceptor(() => { 
  // read and return headers of the incoming HTTP request
});
```
The actual function for retrieving incoming headers depends on the application framework. 

#### MSW Interceptor

If your app doesn’t use `fetch`, you can try the [MSW](https://mswjs.io/docs/integrations/node) interceptor, which can capture a broader range of request types:

```ts
import { setupServer } from 'msw/node';
import { createHandler } from 'request-mocking-protocol/msw';

const mockHandler = createHandler(() => { 
  // read and return headers of the incoming HTTP request
});
const mswServer = setupServer(mockHandler);
mswServer.listen();
```

> Note that MSW is used **only** to capture the request, while the mocks should be declaratively defined using the [MockClient](#api) class.

The function for retrieving incoming HTTP headers depends on the application framework. Example for **Next.js**:
```ts
// app/layout.tsx
import { headers } from 'next/headers';

if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
  const { setupServer } = await import('msw/node');
  const { createHandler } = await import('request-mocking-protocol/msw');
  const mockHandler = createHandler(() => headers());
  const mswServer = setupServer(mockHandler);
  mswServer.listen();
}

export default function RootLayout({ ... });
```

## Comparison with MSW

While both RMP and MSW support request mocking, RMP stands out by enabling **per-test isolation and parallelization for server-side mocks**. It also allows mocking server-side requests when tests run on CI against a remote target.

| Feature                                     | RMP | MSW |
| ------------------------------------------- | :-: | :--: |
| REST API                            |  ✅  |   ✅  |
| GraphQL API                         |  ❌  |   ✅  |
| Arbitrary handler function                  |  ❌  |   ✅  |
| Server-side mocking                         |  ✅  |   ✅  |
| Server-side mocking with per-test isolation |  ✅  |  ❌¹  |
| Server-side mocking on CI                   |  ✅  |   ❌  |

¹ *Per-test isolation in MSW can be achieved via spinning a separate app instance for each test. See [this example](https://github.com/kettanaito/nextjs-rsc-testing).*

## License
[MIT](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)