---
id: nextjs
title: Next.js App Router
slug: /integrations/nextjs
sidebar_position: 1
---

# Next.js App Router

RMP is designed to work seamlessly with popular test runners like Playwright and Cypress, and can also be integrated with custom runners. On the server side, you should set up an [interceptor](/docs/reference/interceptors) to catch the requests and apply your mocks.

Use the [Quick Start: Next.js + Playwright](/docs/getting-started/quick-start) setup for Next.js App Router applications. For **Next.js**, use the [`instrumentation.ts` setup](/docs/getting-started/quick-start#setup-interception-in-nextjs) instead of `layout.tsx`.
