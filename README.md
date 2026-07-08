<p align="center">
  <img src="https://raw.githubusercontent.com/vitalets/request-mocking-protocol/main/docs/static/img/android-chrome-192x192.png" alt="Request Mocking Protocol logo" width="80" height="80" />
</p>

<h1 align="center">Request Mocking Protocol</h1>

[![lint](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/request-mocking-protocol/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/request-mocking-protocol)](https://www.npmjs.com/package/request-mocking-protocol)
[![license](https://img.shields.io/npm/l/request-mocking-protocol)](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)

**Request Mocking Protocol (RMP)** is a specification for HTTP requests mocking in end-to-end tests. It uses declarative JSON schemas to define mocked request and response. These schemas can be serialized and sent over the network, enabling both *client-side* and *server-side* mocking.

## Server-Side Mocking

RMP lets you mock API calls made by your application server. Here's how it works:

<p align="center">
  <img src="https://raw.githubusercontent.com/vitalets/request-mocking-protocol/main/docs/static/img/server-side-mocking.png" alt="How server-side mocking works" width="100%" />
</p>

1. A test defines mock schemas and sends them to the app server in a custom HTTP header: `x-mock-request`.
2. The server-side interceptor reads that header and applies the mocks to the outgoing API calls.
3. The page is rendered with mocked data, and the test can assert the expected UI state.

This is ideal for server-side rendered pages, where data is fetched on the server before the page reaches the browser. Learn how to set it up in **[Server-Side Mocking →](https://vitalets.github.io/request-mocking-protocol/server-side-mocking/overview)**

## Client-Side Mocking

RMP also lets you mock requests made directly in the browser, using the same declarative schemas. It works with any framework, no special integration needed.

This is ideal for single-page apps and any data fetched on the client. Learn how to set it up in **[Client-Side Mocking →](https://vitalets.github.io/request-mocking-protocol/client-side-mocking/overview)**

## 📖 Documentation

Full documentation is available at **[vitalets.github.io/request-mocking-protocol](https://vitalets.github.io/request-mocking-protocol/)**.

- [Introduction](https://vitalets.github.io/request-mocking-protocol/getting-started/introduction)
- [Installation](https://vitalets.github.io/request-mocking-protocol/getting-started/installation)
- [Next.js Integration](https://vitalets.github.io/request-mocking-protocol/server-side-mocking/frameworks/nextjs)
- [Playwright Integration](https://vitalets.github.io/request-mocking-protocol/server-side-mocking/test-runners/playwright)
- [API Reference](https://vitalets.github.io/request-mocking-protocol/api/mock-client)

## License

[MIT](https://github.com/vitalets/request-mocking-protocol/blob/main/LICENSE)
