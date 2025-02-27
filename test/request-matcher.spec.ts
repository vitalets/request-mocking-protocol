import { test, expect } from 'vitest';
import { RequestMatcher } from '../src/request-matcher';
import { buildMockRequestSchema, MockRequestSchemaInit } from '../src/protocol';

let req: Request;

test('match method', () => {
  const matcher = createMatcher({ method: 'GET', url: 'https://example.com/' });

  req = new Request('https://example.com');
  expect(matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { method: 'GET' });
  expect(matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { method: 'get' });
  expect(matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com', { method: 'POST' });
  expect(matcher.match(req)).toEqual(null);
});

// see also test/match-url.spec.ts
test('match url (string)', () => {
  const matcher = createMatcher('https://example.com/foo*');

  req = new Request('https://example.com/foo');
  expect(matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/foo/bar');
  expect(matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com/bar');
  expect(matcher.match(req)).toEqual(null);

  req = new Request('https://example.com');
  expect(matcher.match(req)).toEqual(null);
});

test('match url (regexp)', () => {
  const matcher = createMatcher(/example\.com/);

  req = new Request('https://example.com/foo');
  expect(matcher.match(req)).toBeTruthy();

  req = new Request('https://example.ai/foo');
  expect(matcher.match(req)).toEqual(null);
});

test('match query', () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    query: { foo: '456' },
  });

  req = new Request('https://example.com?foo=456');
  expect(matcher.match(req)).toBeTruthy();

  req = new Request('https://example.com?foo=789');
  expect(matcher.match(req)).toEqual(null);

  req = new Request('https://example.com?foo');
  expect(matcher.match(req)).toEqual(null);

  req = new Request('https://example.com');
  expect(matcher.match(req)).toEqual(null);
});

function createMatcher(inti: MockRequestSchemaInit) {
  return new RequestMatcher(buildMockRequestSchema(inti));
}
