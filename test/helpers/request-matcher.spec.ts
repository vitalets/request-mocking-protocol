import { test, expect } from 'vitest';
import { SchemaMatcher } from '../../src/request-matcher/schema-matcher';
import { buildRequestSchema, MockRequestSchemaInit } from '../../src/protocol';

let req: Request;

function createMatcher(inti: MockRequestSchemaInit) {
  return new SchemaMatcher(buildRequestSchema(inti));
}

test('match method', async () => {
  const matcher = createMatcher({ method: 'GET', url: 'https://example.com/' });

  req = new Request('https://example.com');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { method: 'GET' });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { method: 'get' });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { method: 'POST' });
  expect(await matcher.match(req)).toEqual(null);
});

// see also test/match-url.spec.ts
test('match url (string)', async () => {
  const matcher = createMatcher('https://example.com/foo*');

  req = new Request('https://example.com/foo');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/foo/bar');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/bar');
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com');
  expect(await matcher.match(req)).toEqual(null);
});

test('match url (regexp)', async () => {
  const matcher = createMatcher(/example\.com/);

  req = new Request('https://example.com/foo');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.ai/foo');
  expect(await matcher.match(req)).toEqual(null);
});

test('match query', async () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    query: { foo: '456' },
  });

  req = new Request('https://example.com?foo=456');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com?foo=789');
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com?foo');
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com');
  expect(await matcher.match(req)).toEqual(null);
});

test('match empty query', async () => {
  const matcher = createMatcher({
    url: 'https://example.com/users',
    query: null,
  });

  req = new Request('https://example.com/users');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/users?');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/users?foo=456');
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com/users/');
  expect(await matcher.match(req)).toEqual(null);
});

test('throw when empty query is defined both in URL and query field', () => {
  expect(() =>
    createMatcher({
      url: 'https://example.com/users?',
      query: null,
    }),
  ).toThrow(
    `Query parameters should be defined either in the URL pattern or in the 'query' field.`,
  );
});

test('match headers', async () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    headers: { ['x-my-header']: 'foo' },
  });

  req = new Request('https://example.com', { headers: { ['x-my-header']: 'foo' } });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { headers: { ['x-my-header']: 'bar' } });
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com');
  expect(await matcher.match(req)).toEqual(null);
});

test('match body (string)', async () => {
  const matcher = createMatcher({
    method: 'POST',
    url: 'https://example.com',
    body: 'foo',
  });

  req = new Request('https://example.com', { method: 'POST', body: 'foo' });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { method: 'POST', body: 'bar' });
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com', { method: 'POST' });
  expect(await matcher.match(req)).toEqual(null);
});

test('match body (json)', async () => {
  const matcher = createMatcher({
    method: 'POST',
    url: 'https://example.com',
    body: { foo: 'bar' },
  });

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' }),
  });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar', a: 42 }),
  });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ foo: 'baz' }),
  });
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com', { method: 'POST', body: JSON.stringify({}) });
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com', { method: 'POST' });
  expect(await matcher.match(req)).toEqual(null);
});

test('match url ($regex object)', async () => {
  const matcher = createMatcher({ url: { $regex: 'example\\.com/users/\\d+$' } });

  req = new Request('https://example.com/users/123');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/users/abc');
  expect(await matcher.match(req)).toEqual(null);
});

test('match url ($contains object)', async () => {
  const matcher = createMatcher({ url: { $contains: '/v2/users' } });

  req = new Request('https://example.com/v2/users');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/api/v2/users?page=1');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/v1/users');
  expect(await matcher.match(req)).toEqual(null);
});

test('match url ($contains object) with separate query', async () => {
  const matcher = createMatcher({
    url: { $contains: 'https://example.com/users' },
    query: { page: '1' },
  });

  req = new Request('https://example.com/users?page=1');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/users?page=2');
  expect(await matcher.match(req)).toEqual(null);
});

test('match query ($contains)', async () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    query: { token: { $contains: 'abc' } },
  });

  req = new Request('https://example.com?token=xxabcxx');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com?token=xxx');
  expect(await matcher.match(req)).toEqual(null);
});

test('match query ($regex)', async () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    query: { page: { $regex: '^\\d+$' } },
  });

  req = new Request('https://example.com?page=42');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com?page=abc');
  expect(await matcher.match(req)).toEqual(null);
});

test('match query ($contains) multi-value param', async () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    query: { tag: { $contains: 'foo' } },
  });

  req = new Request('https://example.com?tag=bar&tag=xfooy');
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com?tag=bar&tag=baz');
  expect(await matcher.match(req)).toEqual(null);
});

test('match headers ($contains)', async () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    headers: { Authorization: { $contains: 'Bearer' } },
  });

  req = new Request('https://example.com', { headers: { Authorization: 'Bearer test-token' } });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { headers: { Authorization: 'Basic xxx' } });
  expect(await matcher.match(req)).toEqual(null);

  req = new Request('https://example.com');
  expect(await matcher.match(req)).toEqual(null);
});

test('match headers ($regex)', async () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    headers: { ['x-version']: { $regex: '^v\\d+$' } },
  });

  req = new Request('https://example.com', { headers: { ['x-version']: 'v2' } });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { headers: { ['x-version']: 'beta' } });
  expect(await matcher.match(req)).toEqual(null);
});

test('match body ($contains) at top level', async () => {
  const matcher = createMatcher({
    method: 'POST',
    url: 'https://example.com',
    body: { email: { $contains: '@acme.com' } },
  });

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ email: 'john@acme.com', role: 'admin' }),
  });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ email: 'john@other.com' }),
  });
  expect(await matcher.match(req)).toEqual(null);
});

test('match body ($regex) in nested object, exact sibling still works', async () => {
  const matcher = createMatcher({
    method: 'POST',
    url: 'https://example.com',
    body: {
      user: { email: { $regex: '.+@acme\\.com$' } },
      role: 'admin',
    },
  });

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ user: { email: 'john@acme.com' }, role: 'admin' }),
  });
  expect(await matcher.match(req)).toBeTruthy();

  // exact sibling mismatch
  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ user: { email: 'john@acme.com' }, role: 'user' }),
  });
  expect(await matcher.match(req)).toEqual(null);

  // matcher mismatch
  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ user: { email: 'john@other.com' }, role: 'admin' }),
  });
  expect(await matcher.match(req)).toEqual(null);
});

test('match body array still subset-matches', async () => {
  const matcher = createMatcher({
    method: 'POST',
    url: 'https://example.com',
    body: { items: [{ id: { $contains: 'a' } }] },
  });

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ items: [{ id: 'xax' }] }),
  });
  expect(await matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ items: [{ id: 'xxx' }] }),
  });
  expect(await matcher.match(req)).toEqual(null);
});
