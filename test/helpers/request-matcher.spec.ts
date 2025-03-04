import { test, expect } from 'vitest';
import { RequestMatcher } from '../../src/request-matcher';
import { buildMockRequestSchema, MockRequestSchemaInit } from '../../src/protocol';

let req: Request;

function createMatcher(inti: MockRequestSchemaInit) {
  return new RequestMatcher(buildMockRequestSchema(inti));
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
