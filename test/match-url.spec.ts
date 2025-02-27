import { test, expect } from 'vitest';
import { RequestMatcher } from '../src/request-matcher';
import { buildMockRequestSchema } from '../src/protocol';

test('no hostname slash', () => {
  const matcher = createMatcher('https://example.com');
  match(matcher, 'https://example.com');
  match(matcher, 'https://example.com/');
  // without hostname slash, URLPattern matches any path!
  match(matcher, 'https://example.com/foo');
});

test('with hostname slash', () => {
  const matcher = createMatcher('https://example.com/');
  match(matcher, 'https://example.com');
  match(matcher, 'https://example.com/');
  match(matcher, 'https://example.com/foo', false);
});

test('match query (no hostname slash)', () => {
  const matcher = createMatcher('https://example.com?foo');
  match(matcher, 'https://example.com?foo');
  match(matcher, 'https://example.com/?foo');
  match(matcher, 'https://example.com.foo', false);
});

test('match query (with hostname slash)', () => {
  const matcher = createMatcher('https://example.com/?foo');
  match(matcher, 'https://example.com?foo');
  match(matcher, 'https://example.com/?foo');
  match(matcher, 'https://example.com/?', false);
});

test('with hostname slash, with asterisk', () => {
  const matcher = createMatcher('https://example.com/*');
  match(matcher, 'https://example.com');
  match(matcher, 'https://example.com/');
  match(matcher, 'https://example.com.ru', false);
  match(matcher, 'https://example.com.ru/', false);
  match(matcher, 'https://example.com/foo');
  match(matcher, 'https://example.com?foo');
  match(matcher, 'https://example.com/foo/');
  match(matcher, 'https://example.com/foo/bar');
});

test('match any tld (no hostname slash)', () => {
  const matcher = createMatcher('https://example.com*');
  match(matcher, 'https://example.com');
  match(matcher, 'https://example.com/');
  match(matcher, 'https://example.com.ru');
  match(matcher, 'https://example.com.ru/');
  // without hostname slash, URLPattern matches any path!
  match(matcher, 'https://example.com/foo');
  match(matcher, 'https://example.com/?foo');
  match(matcher, 'https://example.com?foo');
  match(matcher, 'https://example.com/foo/');
  match(matcher, 'https://example.com/foo/bar');
});

test('match any tld (with hostname slash)', () => {
  const matcher = createMatcher('https://example.com*/');
  match(matcher, 'https://example.com');
  match(matcher, 'https://example.com/');
  match(matcher, 'https://example.com.ru');
  match(matcher, 'https://example.com.ru/');
  match(matcher, 'https://example.com/?foo');
  match(matcher, 'https://example.com?foo');
  // with hostname slash, URLPattern matches only path = '/'
  match(matcher, 'https://example.com/foo', false);
  match(matcher, 'https://example.com.ru/foo', false);
  match(matcher, 'https://example.com/foo/', false);
  match(matcher, 'https://example.com/foo/bar', false);
});

// '**' does not make sense in URLPattern, but users may use it.
test('with hostname slash, double asterisk', () => {
  const matcher = createMatcher('https://example.com/**');
  match(matcher, 'https://example.com');
  match(matcher, 'https://example.com/');
  match(matcher, 'https://example.com/foo');
  match(matcher, 'https://example.com?foo');
  match(matcher, 'https://example.com/foo/');
  match(matcher, 'https://example.com/foo/bar');
});

function createMatcher(url: string) {
  return new RequestMatcher(buildMockRequestSchema(url));
}

function match(matcher: RequestMatcher, url: string, shouldMatch = true) {
  const req = new Request(url);
  expect(
    Boolean(matcher.match(req)),
    `pattern: '${matcher.schema.url}' should ${shouldMatch ? '' : 'not '}match url: '${url}'`,
  ).toEqual(shouldMatch);
}
