---
id: introduction
title: Introduction
slug: /getting-started/introduction
sidebar_position: 1
---

# Request Mocking Protocol

**Request Mocking Protocol (RMP)** is a specification for HTTP requests mocking in end-to-end tests. It uses declarative JSON schemas to define mocked request and response. These schemas can be serialized and sent over the network, enabling both *client-side* and *server-side* mocking.

## How It Works

![How RMP works](/img/rmp-schema.png)

1. A test defines mock schemas and sends them to the app server in a custom HTTP header: `x-mock-request`.
2. The server-side interceptor reads that header and applies the mocks to the outgoing API calls.
3. The page is rendered with mocked data, and the test can assert the expected UI state.

Check out the [Concepts](/docs/concepts/mock-schema) and [Limitations](/docs/reference/limitations) for more details.
