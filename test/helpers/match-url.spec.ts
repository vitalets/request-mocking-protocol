import { test, expect } from 'vitest';
import { SchemaMatcher } from '../../src/request-matcher/schema-matcher';
import { UrlPatternObj, buildRequestSchema } from '../../src/protocol';

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

test('match empty query', async () => {
  const matcher = createMatcher('https://example.com/users?');
  await match(matcher, 'https://example.com/users');
  await match(matcher, 'https://example.com/users?');
  await match(matcher, 'https://example.com/users?foo=bar', false);
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

test('match hostname regex in URLPattern string', async () => {
  const matcher = createMatcher('https://example.(com|io)/users');
  await match(matcher, 'https://example.com/users');
  await match(matcher, 'https://example.io/users');
  await match(matcher, 'https://example.org/users', false);
});

test('match named path regex in URLPattern string', async () => {
  const matcher = createMatcher('https://example.com/users/:id(\\d+)');
  await match(matcher, 'https://example.com/users/123');
  await match(matcher, 'https://example.com/users/abc', false);
});

test('match URLPattern component object', async () => {
  const matcher = createMatcher({ hostname: 'example.com', pathname: '/users/:id' });
  await match(matcher, 'https://example.com/users/123');
  await match(matcher, 'http://example.com/users/456');
  await match(matcher, 'https://example.org/users/123', false);
  await match(matcher, 'https://example.com/products/123', false);
});

test('match URLPattern instance', async () => {
  const matcher = createMatcher(
    new URLPattern({
      protocol: 'https',
      hostname: 'example.com',
      port: '8443',
      pathname: '/users/:id',
    }),
  );
  await match(matcher, 'https://example.com:8443/users/123');
  await match(matcher, 'https://example.com/users/123', false);
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

test('$regex object syntax', async () => {
  const matcher = new SchemaMatcher(buildRequestSchema({ url: /\/users\/\d+$/ }));
  await match(matcher, 'https://example.com/users/123');
  await match(matcher, 'https://example.com/users/abc', false);
});

test('$contains object syntax', async () => {
  const matcher = new SchemaMatcher(buildRequestSchema({ url: { $contains: '/users' } }));
  await match(matcher, 'https://example.com/users');
  await match(matcher, 'https://example.com/api/users?page=1');
  await match(matcher, 'https://example.com/products', false);
});

test('legacy patternType regexp still works', async () => {
  const matcher = new SchemaMatcher(
    buildRequestSchema({ url: '/example\\.com\\/users/', patternType: 'regexp' }),
  );
  await match(matcher, 'https://example.com/users');
  await match(matcher, 'https://example.io/users', false);
});

function createMatcher(url: string | UrlPatternObj | URLPattern) {
  return new SchemaMatcher(buildRequestSchema(url));
}

async function match(matcher: SchemaMatcher, url: string, shouldMatch = true) {
  const req = new Request(url);
  expect(
    Boolean(await matcher.match(req)),
    `pattern: '${matcher.schema.url}' should ${shouldMatch ? '' : 'not '}match url: '${url}'`,
  ).toEqual(shouldMatch);
}
