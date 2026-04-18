import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { MockClient } from '../src';
import { setupFetchInterceptor } from '../src/interceptors/fetch';

let mockClient: MockClient;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  setupFetchInterceptor(() => mockClient.headers);
});

beforeEach(() => {
  process.env.REQUEST_MOCKING_DEBUG = '1';
  mockClient = new MockClient();
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  delete process.env.REQUEST_MOCKING_DEBUG;
  logSpy.mockRestore();
});

test('logs newest mocks first when matching', async () => {
  await mockClient.POST('https://example.com/users/:id', { body: 'ok' });
  await mockClient.DELETE('https://example.com', 200);
  await mockClient.ALL('https://example.com/foo', 200);
  await mockClient.GET('https://example.com/', 200);

  await fetch('https://example.com/');

  expectLogs([
    '⬇️  Matching request with mocks (4)',
    '     Actual URL: GET https://example.com/',
    '   Expected URL: GET https://example.com/',
    '✅ Mock matched.',
  ]);
});

test('logs mismatches in newest-first order before a match', async () => {
  await mockClient.GET('https://example.com/', 200);
  await mockClient.ALL('https://example.com/foo', 200);
  await mockClient.DELETE('https://example.com', 200);
  await mockClient.POST('https://example.com/users/:id', { body: 'ok' });

  await fetch('https://example.com/');

  expectLogs([
    '⬇️  Matching request with mocks (4)',
    '     Actual URL:  GET https://example.com/',
    '   Expected URL: POST https://example.com/users/:id',
    '❌ Mock not matched.',
    '     Actual URL:    GET https://example.com/',
    '   Expected URL: DELETE https://example.com',
    '❌ Mock not matched.',
    '     Actual URL: GET https://example.com/',
    '   Expected URL:   * https://example.com/foo',
    '❌ Mock not matched.',
    '     Actual URL: GET https://example.com/',
    '   Expected URL: GET https://example.com/',
    '✅ Mock matched.',
  ]);
});

test('logs all matcher lines when only body does not match', async () => {
  await mockClient.POST(
    {
      url: 'https://example.com/users/:id',
      query: { foo: '1' },
      headers: { 'x-token': 'abc' },
      body: { name: 'John' },
    },
    {
      body: 'ok',
    },
  );

  await fetch('https://example.com/users/1?foo=1', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-token': 'abc',
    },
    body: JSON.stringify({ name: 'Jane' }),
  });

  expectLogs([
    '⬇️  Matching request with mocks (1)',
    '     Actual URL: POST https://example.com/users/1?foo=1',
    '   Expected URL: POST https://example.com/users/:id',
    '     Actual query param "foo": 1',
    '   Expected query param "foo": 1',
    '     Actual header "x-token": abc',
    '   Expected header "x-token": abc',
    '     Actual body: {"name":"Jane"}',
    '   Expected body: {"name":"John"}',
    '❌ Mock not matched.',
  ]);
});

function expectLogs(lines: string[]) {
  const logStrings = logSpy.mock.calls.map((call: unknown[]) => String(call[0]));
  expect(logStrings).toEqual([lines.join('\n')]);
}
