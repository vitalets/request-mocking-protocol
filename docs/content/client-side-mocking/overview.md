---
id: overview
title: Overview
slug: /client-side-mocking/overview
sidebar_position: 1
---

# Client-Side Mocking

Client-side mocking intercepts HTTP requests made **in the browser** and replaces them with mocked responses, using the same declarative syntax as [server-side mocks](/server-side-mocking/overview).

Unlike server-side mocking, it does not require a framework interceptor — the requests are intercepted directly in the browser by the test runner.

Browser-side interception is currently available with **[Playwright](/client-side-mocking/playwright)**.
