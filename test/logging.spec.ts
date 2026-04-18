import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { MockClient } from '../src';
import { setupFetchInterceptor } from '../src/interceptors/fetch';

const mockClient = new MockClient();
let logSpy: ReturnType<typeof vi.spyOn>;

function expectLogs(lines: string[]) {
  const logStrings = logSpy.mock.calls.map((call: unknown[]) => String(call[0]));
  expect(logStrings).toEqual([lines.join('\n')]);
}

beforeAll(() => {
  setupFetchInterceptor(() => mockClient.headers);
});

beforeEach(async () => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  await mockClient.reset();
});

afterEach(() => {
  logSpy.mockRestore();
});

test('logs debug output for matched fetch request', async () => {
  await mockClient.GET(
    {
      url: 'https://example.com/',
      debug: true,
    },
    {
      body: { ok: true },
    },
  );

  const res = await fetch('https://example.com/');
  expect(res.status).toBe(200);

  expectLogs([
    'Matching request: GET https://example.com/',
    '✅ Expected method: GET',
    '     Actual method: GET',
    '✅ Expected URL: https://example.com/',
    '     Actual URL: https://example.com/',
    'Request matched.',
  ]);
});

test('logs debug output for unmatched fetch request', async () => {
  await mockClient.GET(
    {
      url: 'https://example.com/users/:id',
      debug: true,
    },
    {
      body: { ok: true },
    },
  );

  await fetch('https://example.com/posts/1');

  expectLogs([
    'Matching request: GET https://example.com/posts/1',
    '✅ Expected method: GET',
    '     Actual method: GET',
    '❌ Expected URL: https://example.com/users/:id',
    '     Actual URL: https://example.com/posts/1',
    'Request not matched.',
  ]);
});

test('logs all matcher lines when only body does not match', async () => {
  await mockClient.POST(
    {
      url: 'https://example.com/users/:id',
      query: { foo: '1' },
      headers: { 'x-token': 'abc' },
      body: { name: 'John' },
      debug: true,
    },
    {
      body: { ok: true },
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
    'Matching request: POST https://example.com/users/1?foo=1',
    '✅ Expected method: POST',
    '     Actual method: POST',
    '✅ Expected URL: https://example.com/users/:id',
    '     Actual URL: https://example.com/users/1 (query trimmed)',
    '✅ Expected query param "foo": 1',
    '     Actual query param "foo": 1',
    '✅ Expected header "x-token": abc',
    '     Actual header "x-token": abc',
    '❌ Expected body: {"name":"John"}',
    '     Actual body: {"name":"Jane"}',
    'Request not matched.',
  ]);
});
