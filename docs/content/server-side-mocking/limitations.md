---
id: limitations
title: Limitations
slug: /server-side-mocking/limitations
sidebar_position: 4
---

# Limitations

Server-side mocking comes with a few limitations that you should keep in mind.

1. **Static Data Only:** The mock must be serializable to JSON. This means you can't provide arbitrary function-based mocks. To mitigate this restriction, RMP supports [Route Parameters](/writing-mocks/route-parameters) and [Response Patching](/writing-mocks/response-patching) techniques.

2. **Header Size Limits:** HTTP headers typically support 4KB to 8KB of data. If you need to mock larger payloads, consider [Response Patching](/writing-mocks/response-patching) or alternative techniques.

In practice, this is usually acceptable. Mocks should focus on the <strong>minimal state</strong> the test actually needs.
