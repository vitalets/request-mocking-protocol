import { test, expect } from 'vitest';
import { RequestMatcher } from '../src/request-matcher';
import { buildMockRequestSchema, MockRequestSchemaInit } from '../src/protocol';

let req: Request;

test('match method', () => {
  const matcher = createMatcher({ method: 'GET', url: 'https://example.com/' });

  req = new Request('https://example.com');
  expect(matcher.test(req)).toEqual(true);

  req = new Request('https://example.com', { method: 'GET' });
  expect(matcher.test(req)).toEqual(true);

  req = new Request('https://example.com', { method: 'get' });
  expect(matcher.test(req)).toEqual(true);

  req = new Request('https://example.com', { method: 'POST' });
  expect(matcher.test(req)).toEqual(false);
});

// see also test/match-url.spec.ts
test('match url (string)', () => {
  const matcher = createMatcher('https://example.com/foo*');

  req = new Request('https://example.com/foo');
  expect(matcher.test(req)).toEqual(true);

  req = new Request('https://example.com/foo/bar');
  expect(matcher.test(req)).toEqual(true);

  req = new Request('https://example.com/bar');
  expect(matcher.test(req)).toEqual(false);

  req = new Request('https://example.com');
  expect(matcher.test(req)).toEqual(false);
});

test('match url (regexp)', () => {
  const matcher = createMatcher(/example\.com/);

  req = new Request('https://example.com/foo');
  expect(matcher.test(req)).toEqual(true);

  req = new Request('https://example.ai/foo');
  expect(matcher.test(req)).toEqual(false);
});

test('match query', () => {
  const matcher = createMatcher({
    url: 'https://example.com',
    query: { foo: '456' },
  });

  req = new Request('https://example.com?foo=456');
  expect(matcher.test(req)).toEqual(true);

  req = new Request('https://example.com?foo=789');
  expect(matcher.test(req)).toEqual(false);

  req = new Request('https://example.com?foo');
  expect(matcher.test(req)).toEqual(false);

  req = new Request('https://example.com');
  expect(matcher.test(req)).toEqual(false);
});

function createMatcher(inti: MockRequestSchemaInit) {
  return new RequestMatcher(buildMockRequestSchema(inti));
}
