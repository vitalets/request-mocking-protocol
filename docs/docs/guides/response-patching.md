---
id: response-patching
title: Response Patching
slug: /guides/response-patching
sidebar_position: 3
---

# Response Patching

Response patching allows to make a real request, and modify only parts of the response for the testing purposes.
RMP supports response patching by providing the `bodyPatch` key in the response schema:

```ts
await mockClient.GET('https://jsonplaceholder.typicode.com/users', {
  bodyPatch: {
    '[0].address.city': 'New York',
  },
});
```

The final response will contain actual and modified data:

```diff
[
  {
    "id": 1,
    "name": "Leanne Graham",
    "address": {
-      "city": "Gwenborough",
+      "city": "New York",
      ...
    }
  }
  ...
]
```

This technique is particularly useful to keep your tests in sync with actual API responses, while maintaining test stability and logic.

The `bodyPatch` defines fields in a dot-notation form, evaluated with [lodash.set](https://lodash.com/docs/4.17.15#set):

```
{
  [path.to.property]: new value
}
```
