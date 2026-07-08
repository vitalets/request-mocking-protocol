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

**Request Mocking Protocol (RMP)** is a specification for network requests mocking in end-to-end tests. It uses declarative JSON schemas to define mocked request and response. These schemas can be serialized and sent over the network, enabling both **server-side** and **client-side** mocking.

## Server-Side Mocking

RMP lets you mock API calls made by your application server. Here's how it works:

![How server-side mocking works](/img/server-side-mocking.png)

1. A test defines mock schemas and sends them to the app server in a custom HTTP header: `x-mock-request`.
2. The server-side interceptor reads that header and applies the mocks to the outgoing API calls.
3. The page is rendered with mocked data, and the test can assert the expected UI state.

This is ideal for server-side rendered pages, where data is fetched on the server before the page reaches the browser. Learn how to set it up in **[Server-Side Mocking →](/server-side-mocking/overview)**

## Client-Side Mocking

RMP also lets you mock requests made directly in the browser, using the same declarative schemas. It works with any framework, no special integration needed.

This is ideal for single-page apps and any data fetched on the client. Learn how to set it up in **[Client-Side Mocking →](/client-side-mocking/overview)**

---

Ready to try it out? Head over to [Installation](/getting-started/installation) to get started, or dive into the [Concepts](/concepts/mock-schema) to learn more.

