---
id: limitations
title: Limitations
slug: /reference/limitations
sidebar_position: 3
---

# Limitations

1. **Static Data Only:** The mock must be serializable to JSON. This means you can't provide arbitrary function-based mocks. To mitigate this restriction, RMP supports [Route Parameters](/docs/writing-mocks/route-parameters) and [Response Patching](/docs/writing-mocks/response-patching) techniques.

2. **Header Size Limits:** HTTP headers typically support 4KB to 8KB of data. If you need to mock larger payloads, consider [Response Patching](/docs/writing-mocks/response-patching) or alternative techniques.
