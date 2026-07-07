---
id: introduction
title: Introduction
hide_title: true
slug: /getting-started/introduction
sidebar_position: 1
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<div style={{textAlign: 'center', margin: '0 0 2rem'}}>
  <img src={useBaseUrl('/img/logo.svg')} alt="Request Mocking Protocol logo" width="80" height="80" />
  <h1 style={{marginTop: '1rem'}}>Request Mocking Protocol</h1>
</div>

**Request Mocking Protocol (RMP)** is a specification for HTTP requests mocking in end-to-end tests. It uses declarative JSON schemas to define mocked request and response. These schemas can be serialized and sent over the network, enabling both **client-side** and **server-side** mocking.

## How It Works

![How RMP works](/img/rmp-schema.png)

1. A test defines mock schemas and sends them to the app server in a custom HTTP header: `x-mock-request`.
2. The server-side interceptor reads that header and applies the mocks to the outgoing API calls.
3. The page is rendered with mocked data, and the test can assert the expected UI state.

RMP supports two mocking modes:

- **[Server-Side Mocking](/docs/server-side-mocking/overview)** — mock API calls made by your application server.
- **[Client-Side Mocking](/docs/client-side-mocking/overview)** — mock requests made directly in the browser.

Ready to try it out? Head over to [Installation](/docs/getting-started/installation) to get started, or dive into the [Concepts](/docs/concepts/mock-schema) to learn more.

