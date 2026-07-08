---
id: comparison-with-msw
title: Comparison with MSW
slug: /comparison-with-msw
sidebar_position: 4
---

# Comparison with MSW

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
