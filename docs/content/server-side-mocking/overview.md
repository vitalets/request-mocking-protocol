---
id: overview
title: Overview
slug: /server-side-mocking/overview
sidebar_position: 1
---

# Server-Side Mocking

Server-side mocking intercepts HTTP requests made by your **application server** (for example, API calls during server-side rendering) and replaces them with mocked responses.

![How RMP works](/img/rmp-schema.png)

1. A test defines mock schemas and sends them to the app server in a custom HTTP header: `x-mock-request`.
2. A server-side interceptor reads that header and applies the mocks to the outgoing API calls.
3. The page is rendered with mocked data, and the test asserts the expected UI state.

Server-side mocking requires two pieces of setup:

- **[Framework integration](/docs/server-side-mocking/frameworks/nextjs)** — installs the interceptor that reads the header and captures outgoing requests on the server.
- **[Test runner integration](/docs/server-side-mocking/test-runners/playwright)** — sends the mock header from your tests to the app server.

To mock requests made directly in the browser, see [Client-Side Mocking](/docs/client-side-mocking/overview).
