# Request Mocking Protocol

[![lint](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/request-mocking-protocol)](https://www.npmjs.com/package/request-mocking-protocol)
[![license](https://img.shields.io/npm/l/request-mocking-protocol)](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)

**Request Mocking Protocol (RMP)** is a specification for HTTP requests mocking in end-to-end tests. It uses declarative JSON schemas to define mocked request and response. These schemas can be serialized and sent over the network, enabling both *client-side* and *server-side* mocking.

## How It Works

![How RMP works](https://raw.githubusercontent.com/vitalets/request-mocking-protocol/refs/heads/main/scripts/img/rmp-schema.png)

1. A test defines mocks and sends them to the app server in a custom HTTP header: `x-mock-request`.
2. The server-side interceptor reads that header and uses the mock schemas to intercept API calls.
3. The page is rendered with mocked data, and the test can assert the expected UI.

Check out the [Concepts](#concepts) and [Limitations](#limitations) for more details.

## Index
<details>
<summary>Click to expand</summary>

<!-- doc-gen TOC maxDepth="3" excludeText="Index" -->
- [How It Works](#how-it-works)
- [Index](#index)
- [Installation](#installation)
  - [npm](#npm)
  - [pnpm](#pnpm)
  - [Yarn](#yarn)
- [Quick Start: Next.js + Playwright](#quick-start-nextjs--playwright)
  - [Setup Interception in Next.js](#setup-interception-in-nextjs)
  - [Setup `MockClient` in Playwright](#setup-mockclient-in-playwright)
- [Request Matching](#request-matching)
  - [URL](#url)
  - [Method](#method)
  - [Query](#query)
  - [Headers](#headers)
  - [Body](#body)
  - [Combination](#combination)
- [Response Mocking](#response-mocking)
  - [Body](#body-1)
  - [Headers](#headers-1)
  - [Status Code](#status-code)
  - [Delay](#delay)
  - [Combination](#combination-1)
- [Response Patching](#response-patching)
- [Route Parameters](#route-parameters)
- [Debugging](#debugging)
- [Integrations](#integrations)
  - [Next.js App Router](#nextjs-app-router)
  - [Playwright](#playwright)
  - [Cypress](#cypress)
  - [Astro](#astro)
  - [Custom Test Runner](#custom-test-runner)
  - [Custom Framework](#custom-framework)
- [Client-Side Mocks](#client-side-mocks)
- [Concepts](#concepts)
  - [Request Schema](#request-schema)
  - [Response Schema](#response-schema)
  - [Transport](#transport)
- [API Reference](#api-reference)
  - [MockClient](#mockclient)
  - [Interceptors](#interceptors)
- [Limitations](#limitations)
- [Comparison with MSW](#comparison-with-msw)
- [License](#license)
<!-- end-doc-gen -->

</details>

## Installation

Install with any package manager:

### npm

```sh
npm install --save-dev request-mocking-protocol
```

### pnpm

```sh
pnpm add --save-dev request-mocking-protocol
```

### Yarn

```sh
yarn add --dev request-mocking-protocol
```

## Quick Start: Next.js + Playwright

This setup mocks server-side `fetch` calls made by a Next.js app during Playwright tests.

### Setup Interception in Next.js

The Next.js setup includes two parts.

#### 1. Setup Instrumentation

Enable fetch interception in `instrumentation.ts` for normal server startup.

Create `src/patch-fetch.mjs` with the following content:

```js
// Patch fetch for testing.
// Keep this file as js to be able to import in the dev command.
import { setupFetchInterceptor } from 'request-mocking-protocol/fetch';

setupFetchInterceptor(async () => {
  const { headers } = await import('next/headers.js');
  return headers();
});
```

Import the patch in `src/instrumentation.ts` (adjust the env variable for your project):

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.VERCEL_ENV !== 'production') {
    await import('./patch-fetch.mjs');
  }
}
```

> [!NOTE]
> When deploying on Vercel, don't use `process.env.NODE_ENV` for detecting non-production environment,
> because even preview deployments will have it as `production`.

#### 2. Adjust `next dev` command

Add interceptor to the `next dev` command, so it remains active across HMR reloads. Update `package.json`:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--import ./src/patch-fetch.mjs' next dev"
  }
}
```

> [!IMPORTANT]
> This `next dev` command import should become unnecessary once Next.js preserves the instrumented `fetch` across HMR automatically (see [#92877](https://github.com/vercel/next.js/issues/92877)).

> [!IMPORTANT]
> Placing the fetch interceptor in `layout.tsx` is no longer recommended.

Now your Next.js server is ready for testing.

### Setup `MockClient` in Playwright

Each test defines its own mocks using a [`MockClient`](#mockclient) class. Mocks are not shared across tests, enabling **per-test mock isolation** and **full parallelization**.

#### 1. Setup a custom fixture `mockServerRequest`

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

#### 2. Use `mockServerRequest` in test to define server-side mocks

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

See the full working example in [`examples/nextjs-playwright`](examples/nextjs-playwright).

## Request Matching

RMP offers flexible matching options to ensure your mocks are applied exactly when you need them.

### URL

URL strings are matched with [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)-style syntax. URLPattern has a few matching rules that can differ from common glob or routing syntax, so review the URLPattern docs carefully when using wildcards or query-string patterns.

#### Wildcard

In URLPattern syntax, `*` matches any character sequence, not a single path segment:

```ts
await mockClient.GET('https://example.com/users/*', /* response */);
```

```txt
https://example.com/users/                matches
https://example.com/users/1               matches
https://example.com/users/1/posts         matches
https://example.com/users                 does not match
https://example.com/users?page=1          does not match
https://example.com/products/1            does not match
```

Wildcards can also be used inside the hostname. The hostname wildcard matches any character sequence inside the hostname component, including dots:

```ts
await mockClient.GET('https://*.example.com/users', /* response */);
```

```txt
https://api.example.com/users              matches
https://cdn.example.com/users              matches
https://foo.bar.example.com/users          matches
https://example.com/users                  does not match
https://api.example.com/users/1            does not match
https://api.example.org/users              does not match
```

For any subdomain plus the root domain, use:
```js
await mockClient.GET('https://{*.}?example.com', /* response */);
```

#### Full URL String

Match requests by providing a full URL string.

```ts
await mockClient.GET('https://example.com/users', /* response */);
```

Important: this string matches any query parameters. URLPattern treats a missing search component as `*`, so the mock above matches all of these requests:

```txt
https://example.com/users                matches
https://example.com/users?page=1         matches
https://example.com/users?anything=here  matches
```

Set `query: null` to match string URL without any query parameters:

```ts
await mockClient.GET({
  url: 'https://example.com/users',
  query: null,
}, /* response */);
```

Examples:

```txt
https://example.com/users                matches
https://example.com/users?               matches
https://example.com/users?page=1         does not match
https://example.com/users?anything=here  does not match
```

The URLPattern equivalent is a trailing `?`, which creates an explicit empty search component:

```ts
await mockClient.GET('https://example.com/users?', /* response */);
```

#### Trailing Slash

URLPattern does not ignore trailing slashes by default. To match both `/users` and `/users/`, use an optional group as described in the [URLPattern pattern syntax docs](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#constructing_a_urlpattern):

```ts
await mockClient.GET('https://example.com/users{/}?', /* response */);
```

```txt
https://example.com/users   matches
https://example.com/users/  matches
```

#### Regular Expression

Match requests using JavaScript regular expressions.

```ts
await mockClient.GET(/\/users\/\d+$/, /* response */);
```

### Method

Explicitly define the HTTP method to match:

```ts
// GET
await mockClient.GET('https://api.example.com/users', /* response */);
// POST
await mockClient.POST('https://api.example.com/users', /* response */);
// Any HTTP method
await mockClient.ALL('https://api.example.com/users', /* response */);
```

### Query

Match requests by specific URL query parameters:

```ts
await mockClient.GET({
  url: 'https://api.example.com/users',
  query: { 
    role: 'admin' 
  },
}, /* response */);
```

```txt
https://api.example.com/users?role=admin         matches
https://api.example.com/users?role=admin&page=1  matches
https://api.example.com/users                    does not match
https://api.example.com/users?role=user          does not match
https://api.example.com/posts?role=admin         does not match
```

When `query` is defined, RMP trims the request URL's search params before URLPattern matching and then checks the listed query params separately. Extra query params are allowed. To require a URL with no query params, set `query` to `null`:

```ts
await mockClient.GET({
  url: 'https://api.example.com/users',
  query: null,
}, /* response */);
```

> If both `url` with query and `query` field are defined, it will be an error.

### Headers

Match requests by HTTP headers:

```ts
await mockClient.GET({
  url: 'https://api.example.com/users',
  headers: { 
    authorization: 'Bearer test-token' 
  },
}, /* response */);
```

### Body

Match requests by string or JSON request body.
```ts
await mockClient.POST({
  url: 'https://api.example.com/users',
  body: { 
    role: 'admin' 
  },
}, /* response */);
```

### Combination

Combine all matchers together:

```ts
await mockClient.POST({
  url: 'https://api.example.com/users',
  query: { 
    active: 'true' 
  },
  headers: { 
    authorization: 'Bearer test-token' 
  },
  body: { 
    role: 'admin' 
  },
}, /* response */);
```

If multiple mocks match the same request, the most recently added matching mock is used. Mock precedence is based on registration order, not URL specificity.

## Response Mocking

RMP lets you mock any part of the response.

### Body

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

### Headers

Set response headers:

```ts
await mockClient.GET(/* req */, {
  headers: { 
    'content-type': 'application/json' 
  },
});
```

### Status Code

Set arbitrary HTTP status code to emulate errors:

```ts
// Emulate 500 Internal Server Error
await mockClient.GET(/* req */, 500);

// or with full syntax
await mockClient.GET(/* req */, {
  status: 500
});
```

### Delay

Set arbitrary response delay in miliseconds:

```ts
await mockClient.GET(/* req */, {
  delay: 1000
});
```

### Combination

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

## Response Patching

Response patching allows to make a real request, and modify only parts of the response for the testing purposes.
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

The `bodyPatch` defines fields in a dot-notation form, evaluated with [lodash.set](https://lodash.com/docs/4.17.15#set):

```
{
  [path.to.property]: new value
}
```

## Route Parameters

You can define [route parameters](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#fixed_text_and_capture_groups) in the URL pattern and use them in the response via `{{ }}` syntax:

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

## Debugging

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

![Debug logs](https://raw.githubusercontent.com/vitalets/request-mocking-protocol/refs/heads/main/scripts/img/debug.png)

## Integrations

RMP is designed to work seamlessly with popular test runners like Playwright and Cypress, and can also be integrated with custom runners.

On the server side, you should set up an [interceptor](#interceptors) to catch the requests and apply your mocks.

### Next.js App Router

Use the [`Quick Start: Next.js + Playwright`](#quick-start-nextjs--playwright) setup for Next.js App Router applications. For **Next.js**, use the [`instrumentation.ts` setup](#setup-interception-in-nextjs) instead of `layout.tsx`.

### Playwright

Use the [`Setup Playwright`](#setup-playwright) fixture to send mocks to your application server through Playwright's browser context headers.

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

### Astro

See [astro.config.ts](examples/astro-cypress/astro.config.ts) in the astro-cypress example.

### Custom Test Runner

You can integrate RMP with any test runner. It requires two steps:

1. Use the [`MockClient`](#mockclient) class to define mocks.
   ```js
   const mockClient = new MockClient();
   ```

2. Attach [`mockClient.headers`](#headers-recordstring-string) to the navigation request.
   ```js
   const headers = {
    ...mockClient.headers
   };
   // ...navigate to the page with provided headers
   ```

### Custom Framework

You can write an interceptor for any framework. It requires two steps:

1. Read the HTTP headers of the incoming request.
2. Capture outgoing HTTP requests.

Check out the reference implementations in the [src/interceptors](src/interceptors) directory.

## Client-Side Mocks

You can mock client-side requests with the same syntax as server-side mocks. 
To achieve it in Playwright, create a `mockBrowserRequest` fixture:

```ts
import { test as base } from '@playwright/test';
import { MockClient } from 'request-mocking-protocol';
import { setupPlaywrightInterceptor } from 'request-mocking-protocol/playwright';

export const test = base.extend<{ mockBrowserRequest: MockClient }>({
  mockBrowserRequest: async ({ context }, use) => {
    const mockClient = new MockClient();
    await setupPlaywrightInterceptor(context, mockClient);
    await use(mockClient);
  },
});
```

Then use it in tests:
```ts
test('my test', async ({ page, mockBrowserRequest }) => {
  // set up browser-side mock
  await mockBrowserRequest.GET('https://jsonplaceholder.typicode.com/users', {
    body: [{ id: 1, name: 'John Smith' }],
  });

  // navigate to the page
  await page.goto('/');

  // assert page content according to mock
  await expect(page).toContainText('John Smith');
});
```

## Concepts

### Request Schema

The request schema is a serializable object that defines parameters for matching a request.

[Full schema definition](src/protocol/request-schema.ts).

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

### Response Schema

The response schema is a serializable object that defines how to build the mocked response.

[Full schema definition](src/protocol/response-schema.ts).

Example:

```js
{
  status: 200,
  body: 'Hello world'
}
```

### Transport

Request-mocking-protocol uses a custom HTTP header `x-mock-request` for transferring JSON-stringified schemas from the test runner to the application server.

Example:

```
x-mock-request: [{"reqSchema":{"method":"GET","patternType":"urlpattern","url":"https://example.com"},"resSchema":{"body":"hello","status":200}}]
```

On the server side, the interceptor will read the incoming headers and apply the mocks.

## API Reference

### MockClient

The `MockClient` class is used on the test-runner side to define HTTP request mocks.

#### Constructor

##### `constructor(options?: MockClientOptions)`

Creates a new instance of `MockClient`.

- `options` (optional): An object containing configuration options.
  - `debug` (optional): A boolean indicating whether to enable debug mode.

#### Properties

##### `headers: Record<string, string>`

Returns HTTP headers that are built from the mock schemas. Should be sent to the server for mocking server-side requests.

##### `onChange?: (headers: Record<string, string>) => void`

A callback function that is called whenever the mocks are changed. Accepts `headers` parameter that can be attached to the browsing context and send to the server.

#### Methods

##### `async addMock(reqSchema, resSchema): Promise<void>`
##### `async GET(reqSchema, resSchema): Promise<void>`
##### `async POST(reqSchema, resSchema): Promise<void>`
##### `async PUT(reqSchema, resSchema): Promise<void>`
##### `async PATCH(reqSchema, resSchema): Promise<void>`
##### `async DELETE(reqSchema, resSchema): Promise<void>`
##### `async HEAD(reqSchema, resSchema): Promise<void>`
##### `async ALL(reqSchema, resSchema): Promise<void>`

Adds a new mock for the corresponding HTTP method.

If multiple mocks match the same request, the most recently added matching mock is used. Mock precedence is based on registration order, not URL specificity.

- `reqSchema: string | RegExp | object` – The request matching schema for the mock.
    - If defined as `string`, it is treated as [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) for matching the request only by URL. A URL string without an explicit search component matches any query string.
    - If defined as `RegExp`, it is treated as [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) for matching the request only by URL.
    - If defined as `object`, it is treated as [MockRequestSchemaInit](src/protocol/request-schema.ts) type.

- `resSchema: number | object`: The response schema for the mock.
    - If defined as `number`, it is treated as an HTTP status code.
    - If defined as `object`, it is treated as [MockResponseSchema](src/protocol/response-schema.ts) type.

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

##### `async reset(): Promise<void>`

Clears all mocks and rebuilds the headers.

### Interceptors

Interceptors are used on the server to capture HTTP requests and apply mocks.
Currently, there are two server-side interceptors available.

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

> Note that MSW is used **only** to capture the request, while the mocks should be declaratively defined using the [MockClient](#api-reference) class.

The function for retrieving incoming HTTP headers depends on the application framework.
For **Next.js**, use the [`instrumentation.ts` setup](#setup-interception-in-nextjs) instead of `layout.tsx`.

#### Playwright Interceptor

The Playwright interceptor is used in Playwright tests to mock page requests with the same syntax as for server requests.

```ts
import { setupPlaywrightInterceptor } from 'request-mocking-protocol/playwright';

await setupPlaywrightInterceptor(page, mockClient);
```

Use it for in-browser requests. For server-side requests in Next.js, use the [`Global Fetch`](#global-fetch) interceptor through the [quick start setup](#quick-start-nextjs--playwright).

## Limitations

1. **Static Data Only:** The mock must be serializable to JSON. This means you can't provide arbitrary function-based mocks. To mitigate this restriction, RMP supports [Parameter Substitution](#use-route-parameters) and [Response Patching](#patch-real-responses) techniques.

2. **Header Size Limits:** HTTP headers typically support 4KB to 8KB of data. If you need to mock larger payloads, consider [Response patching](#patch-real-responses) or alternative techniques.

## Comparison with MSW

While both RMP and MSW support request mocking, RMP stands out by enabling **per-test isolation and parallelization for server-side mocks**. It also allows mocking server-side requests when tests run on CI against a remote target.

| Feature                                     | RMP | MSW |
| ------------------------------------------- | :-: | :--: |
| REST API                                    |  ✅  |  ✅  |
| GraphQL API                                 |  ❌  |  ✅  |
| Arbitrary handler function                  |  ❌  |  ✅  |
| Server-side mocking                         |  ✅  |  ✅  |
| Server-side mocking with per-test isolation |  ✅  |  ❌¹  |
| Server-side mocking on CI                   |  ✅  |  ❌  |

¹ *Per-test isolation in MSW can be achieved via spinning a separate app instance for each test. See [this example](https://github.com/kettanaito/nextjs-rsc-testing).*

## License

[MIT](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)
