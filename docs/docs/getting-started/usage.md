---
id: usage
title: Usage
slug: /getting-started/usage
sidebar_position: 3
---

# Usage

After [installation](/docs/getting-started/installation), the next steps depend on **where your app makes the HTTP requests you want to mock**. Follow the guide below to figure out what to set up.

## 1. Decide what to mock

First, identify where the requests you want to intercept originate:

- **Server-side** — requests made by your **application server**, for example API calls during server-side rendering (SSR), route handlers, or server actions. Use [Server-Side Mocking](/docs/server-side-mocking/overview).
- **Client-side** — requests made **directly in the browser**, for example `fetch` or `XMLHttpRequest` calls from your frontend code. Use [Client-Side Mocking](/docs/client-side-mocking/overview).
- **Both** — many apps make requests from both places. In that case, set up server-side and client-side mocking together, reusing the same mock schemas.

If you are unsure, check your browser's network tab: requests that appear there are client-side, while data already present in the initial HTML response is fetched server-side.

## 2. Set up server-side mocking

If you need to mock requests made by your application server, complete **two** integrations:

1. **Framework integration** — install the interceptor that reads the mock header and captures outgoing requests on the server. Pick the guide that matches your app framework:
   - [Next.js](/docs/server-side-mocking/frameworks/nextjs)
   - [Astro](/docs/server-side-mocking/frameworks/astro)
   - [Custom framework](/docs/server-side-mocking/frameworks/custom)
2. **Test runner integration** — send the mock header from your tests to the app server. Pick the guide that matches your test runner:
   - [Playwright](/docs/server-side-mocking/test-runners/playwright)
   - [Cypress](/docs/server-side-mocking/test-runners/cypress)
   - [Custom test runner](/docs/server-side-mocking/test-runners/custom)

## 3. Set up client-side mocking

If you need to mock requests made in the browser, follow the guide for your test runner:

- [Playwright](/docs/client-side-mocking/playwright)

Client-side mocking does not require a framework interceptor — requests are intercepted directly in the browser by the test runner.

## 4. Write your mocks

Once the integration is in place, you can define mocks in your tests. The syntax is the same for both server-side and client-side mocking:

- [Request Matching](/docs/writing-mocks/request-matching)
- [Response Mocking](/docs/writing-mocks/response-mocking)
- [Response Patching](/docs/writing-mocks/response-patching)
- [Route Parameters](/docs/writing-mocks/route-parameters)
- [Debugging](/docs/writing-mocks/debugging)

