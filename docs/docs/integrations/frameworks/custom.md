---
id: custom
title: Custom
slug: /integrations/framework/custom
sidebar_position: 3
---

# Custom Framework

You can write an interceptor for any framework. It requires two steps:

1. Read the HTTP headers of the incoming request.
2. Capture outgoing HTTP requests.

Check out the reference implementations in the [src/interceptors](https://github.com/vitalets/request-mocking-protocol/tree/main/src/interceptors) directory.
