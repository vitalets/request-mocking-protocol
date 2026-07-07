---
id: route-parameters
title: Route Parameters
slug: /guides/route-parameters
sidebar_position: 4
---

# Route Parameters

You can define [route parameters](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#fixed_text_and_capture_groups) in the URL pattern and use them in the response via `{{ }}` syntax:

```ts
await mockClient.GET('https://jsonplaceholder.typicode.com/users/:id', {
  body: {
    id: '{{ id:number }}',
    name: 'User {{ id }}',
  }
});
```

The request:

```
GET https://jsonplaceholder.typicode.com/users/1
```

will be mocked with the response:

```js
{
  id: 1,
  name: 'User 1',
}
```
