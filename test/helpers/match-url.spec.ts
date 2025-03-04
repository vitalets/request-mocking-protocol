import { test, expect } from 'vitest';
import { RequestMatcher } from '../../src/request-matcher';
import { buildMockRequestSchema } from '../../src/protocol';

test('no hostname slash', async () => {
  const matcher = createMatcher('https://example.com');
  await match(matcher, 'https://example.com');
  await match(matcher, 'https://example.com/');
  // without hostname slash, URLPattern matches any path!
  await match(matcher, 'https://example.com/foo');
});

test('with hostname slash', async () => {
  const matcher = createMatcher('https://example.com/');
  await match(matcher, 'https://example.com');
  await match(matcher, 'https://example.com/');
  await match(matcher, 'https://example.com/foo', false);
});

test('match query (no hostname slash)', async () => {
  const matcher = createMatcher('https://example.com?foo');
  await match(matcher, 'https://example.com?foo');
  await match(matcher, 'https://example.com/?foo');
  await match(matcher, 'https://example.com.foo', false);
});

test('match query (with hostname slash)', async () => {
  const matcher = createMatcher('https://example.com/?foo');
  await match(matcher, 'https://example.com?foo');
  await match(matcher, 'https://example.com/?foo');
  await match(matcher, 'https://example.com/?', false);
});

test('with hostname slash, with asterisk', async () => {
  const matcher = createMatcher('https://example.com/*');
  await match(matcher, 'https://example.com');
  await match(matcher, 'https://example.com/');
  await match(matcher, 'https://example.com.ru', false);
  await match(matcher, 'https://example.com.ru/', false);
  await match(matcher, 'https://example.com/foo');
  await match(matcher, 'https://example.com?foo');
  await match(matcher, 'https://example.com/foo/');
  await match(matcher, 'https://example.com/foo/bar');
});

test('match any tld (no hostname slash)', async () => {
  const matcher = createMatcher('https://example.com*');
  await match(matcher, 'https://example.com');
  await match(matcher, 'https://example.com/');
  await match(matcher, 'https://example.com.ru');
  await match(matcher, 'https://example.com.ru/');
  // without hostname slash, URLPattern matches any path!
  await match(matcher, 'https://example.com/foo');
  await match(matcher, 'https://example.com/?foo');
  await match(matcher, 'https://example.com?foo');
  await match(matcher, 'https://example.com/foo/');
  await match(matcher, 'https://example.com/foo/bar');
});

test('match any tld (with hostname slash)', async () => {
  const matcher = createMatcher('https://example.com*/');
  await match(matcher, 'https://example.com');
  await match(matcher, 'https://example.com/');
  await match(matcher, 'https://example.com.ru');
  await match(matcher, 'https://example.com.ru/');
  await match(matcher, 'https://example.com/?foo');
  await match(matcher, 'https://example.com?foo');
  // with hostname slash, URLPattern matches only path = '/'
  await match(matcher, 'https://example.com/foo', false);
  await match(matcher, 'https://example.com.ru/foo', false);
  await match(matcher, 'https://example.com/foo/', false);
  await match(matcher, 'https://example.com/foo/bar', false);
});

// '**' does not make sense in URLPattern, but users may use it.
test('with hostname slash, double asterisk', async () => {
  const matcher = createMatcher('https://example.com/**');
  await match(matcher, 'https://example.com');
  await match(matcher, 'https://example.com/');
  await match(matcher, 'https://example.com/foo');
  await match(matcher, 'https://example.com?foo');
  await match(matcher, 'https://example.com/foo/');
  await match(matcher, 'https://example.com/foo/bar');
});

function createMatcher(url: string) {
  return new RequestMatcher(buildMockRequestSchema(url));
}

async function match(matcher: RequestMatcher, url: string, shouldMatch = true) {
  const req = new Request(url);
  expect(
    Boolean(await matcher.match(req)),
    `pattern: '${matcher.schema.url}' should ${shouldMatch ? '' : 'not '}match url: '${url}'`,
  ).toEqual(shouldMatch);
}
