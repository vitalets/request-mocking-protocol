---
id: request-matching
title: Request Matching
slug: /writing-mocks/request-matching
sidebar_position: 1
---

# Request Matching

RMP offers flexible matching options to ensure your mocks are applied exactly when you need them.

## URL

### String

URL strings are matched with [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)-style syntax. URLPattern has a few matching rules that can differ from common glob or routing syntax, so review the URLPattern docs carefully when using wildcards or query-string patterns.

:::tip
Use the [URL Pattern Checker](https://vitalets.github.io/url-pattern-checker/) to test and debug your URLPattern strings.
:::

#### Full URL String

Match requests by providing a full URL string.

```ts
await mockClient.GET('https://example.com/users', /* response */);
```

Important: this string matches any query parameters. URLPattern treats a missing search component as `*`, so the mock above matches all of these requests:

```txt
https://example.com/users                matches
https://example.com/users?page=1         matches
https://example.com/users?anything=here  matches
```

Set `query: null` to match string URL without any query parameters:

```ts
await mockClient.GET({
  url: 'https://example.com/users',
  query: null,
}, /* response */);
```

Examples:

```txt
https://example.com/users                matches
https://example.com/users?               matches
https://example.com/users?page=1         does not match
https://example.com/users?anything=here  does not match
```

The URLPattern equivalent is a trailing `?`, which creates an explicit empty search component:

```ts
await mockClient.GET('https://example.com/users?', /* response */);
```

##### Named Groups

Named groups capture a part of the matched URL under a given name using `:name` syntax. They match any character sequence that doesn't cross a path segment boundary (i.e. stops at `/`).

```ts
await mockClient.GET('https://example.com/users/:id', /* response */);
```

```txt
https://example.com/users/123  matches  (id = "123")
https://example.com/users/abc  matches  (id = "abc")
https://example.com/users      does not match
```

Named groups can be used in the response body via `{{ name }}` substitution — see [Route Parameters](/docs/writing-mocks/route-parameters).

You can also use named groups in the hostname. In that case the group stops at `.` instead of `/`:

```ts
await mockClient.GET('https://:env.example.com/users', /* response */);
```

```txt
https://api.example.com/users      matches  (env = "api")
https://staging.example.com/users  matches  (env = "staging")
https://example.com/users          does not match
```

##### Regex in URLPattern

URLPattern strings can include regex matchers inside **parentheses**. It can be named `:name(regex)` or unnamed `(regex)`. Use them to define alternative URL parts or constraints.

**Example 1**: match two hostnames `example.com` and `example.io`:

```ts
await mockClient.GET('https://example.(com|io)/users', /* response */);
```

```txt
https://example.com/users  matches
https://example.io/users   matches
https://example.org/users  does not match
```

**Example 2**: match only URLs with digits in user id:

```ts
await mockClient.GET('https://example.com/users/:id(\\d+)', /* response */);
```

```txt
https://example.com/users/123  matches
https://example.com/users/abc  does not match
```

> In JavaScript and TypeScript strings, escape regex backslashes as `\\`. For example, write `\\d+` instead of `\d+`.

#### Wildcard

In URLPattern syntax, `*` matches any character sequence, not a single path segment:

```ts
await mockClient.GET('https://example.com/users/*', /* response */);
```

```txt
https://example.com/users/                matches
https://example.com/users/1               matches
https://example.com/users/1/posts         matches
https://example.com/users                 does not match
https://example.com/users?page=1          does not match
https://example.com/products/1            does not match
```

Wildcards can also be used inside the hostname. The hostname wildcard matches any character sequence inside the hostname component, including dots:

```ts
await mockClient.GET('https://*.example.com/users', /* response */);
```

```txt
https://api.example.com/users              matches
https://cdn.example.com/users              matches
https://foo.bar.example.com/users          matches
https://example.com/users                  does not match
https://api.example.com/users/1            does not match
https://api.example.org/users              does not match
```

For any subdomain plus the root domain, use:
```js
await mockClient.GET('https://{*.}?example.com', /* response */);
```

#### Trailing Slash

URLPattern does not ignore trailing slashes by default. To match both `/users` and `/users/`, use an optional group as described in the [URLPattern pattern syntax docs](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#trailing_slashes_in_pathname_are_not_matched_by_default):

```ts
await mockClient.GET('https://example.com/users{/}?', /* response */);
```

```txt
https://example.com/users   matches
https://example.com/users/  matches
```

### Regex

RMP accepts `RegExp` object instead of string, that is more predictable in some cases. This exmaple matches any URL with `/users/xxx` pathname:

```ts
await mockClient.GET(/\/users\/\d+$/, /* response */);
```

### Object

Instead of a plain string, `url` can be a matcher object using the same `$regex` / `$contains` vocabulary shared with query, headers and body [value matchers](#value-matchers). A plain string is already a URLPattern (the default), so there's no separate key for it.

```ts
// URLPattern (default) — just a plain string
await mockClient.GET('https://example.com/users/*', /* response */);

// Regular expression
await mockClient.GET({ url: { $regex: '/users/\\d+$' } }, /* response */);

// Substring match
await mockClient.GET({ url: { $contains: '/v2/users' } }, /* response */);
```

```txt
// url: { $contains: '/v2/users' }
https://example.com/v2/users            matches
https://example.com/api/v2/users?page=1 matches
https://example.com/v1/users            does not match
```

:::note
The legacy `patternType: 'urlpattern' | 'regexp'` sibling field is still supported but deprecated — prefer the `url` matcher object above.
:::

## Method

Explicitly define the HTTP method to match:

```ts
// GET
await mockClient.GET('https://api.example.com/users', /* response */);
// POST
await mockClient.POST('https://api.example.com/users', /* response */);
// Any HTTP method
await mockClient.ALL('https://api.example.com/users', /* response */);
```

## Query

Match requests by specific URL query parameters:

```ts
await mockClient.GET({
  url: 'https://api.example.com/users',
  query: { 
    page: '1'
  },
}, /* response */);
```

This matches query `page=1` in any position:

```txt
https://api.example.com/users?page=1             matches
https://api.example.com/users?page=1&size=10     matches
https://api.example.com/users?size=10&page=1     matches
https://api.example.com/users                    does not match
https://api.example.com/users?size=10            does not match
```

To require a URL with no query params, set `query` to `null`:

```ts
await mockClient.GET({
  url: 'https://api.example.com/users',
  query: null,
}, /* response */);
```

## Headers

Match requests by HTTP headers:

```ts
await mockClient.GET({
  url: 'https://api.example.com/users',
  headers: { 
    Authorization: 'Bearer test-token' 
  },
}, /* response */);
```

## Body

Match requests by string or JSON request body.
```ts
await mockClient.POST({
  url: 'https://api.example.com/users',
  body: { 
    role: 'admin' 
  },
}, /* response */);
```

## Value Matchers

By default query params, headers and body fields are matched by exact equality. To match more loosely, replace any value with a **matcher object**. The same matchers also power the [URL matcher object](#matcher-object).

| Matcher | Meaning |
|---|---|
| `{ $contains: 'x' }` | value is a string that includes the substring `x` |
| `{ $regex: 'x' }` | value is a string matching the regular expression `x` (plain pattern, or `'/pattern/flags'`) |

```ts
await mockClient.POST({
  url: 'https://api.example.com/users',
  query: { page: { $regex: '^\\d+$' } },
  headers: { Authorization: { $contains: 'Bearer' } },
  body: {
    email: { $regex: '.+@acme\\.com$' },
    role: 'admin', // still matched exactly
  },
}, /* response */);
```

In `body`, matchers work at any nesting depth; every other field keeps the existing subset (partial) matching behavior.

> The `$` prefix marks a key as an operator rather than a literal field. Real HTTP/JSON values essentially never use `$`-prefixed keys, so this avoids colliding with actual field names.

## Combination

Combine all matchers together:

```ts
await mockClient.POST({
  url: 'https://api.example.com/users',
  query: { 
    page: '1'
  },
  headers: { 
    Authorization: 'Bearer test-token' 
  },
  body: { 
    role: 'admin' 
  },
}, /* response */);
```

If multiple mocks match the same request, the most recently added matching mock is used. Mock precedence is based on registration order, not URL specificity.
