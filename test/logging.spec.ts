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

test('logs first mismatch then match for two mocks', async () => {
  await mockClient.POST(
    {
      url: 'https://example.com/users/:id',
      debug: true,
    },
    {
      body: { ok: true },
    },
  );
  await mockClient.DELETE(
    {
      url: 'https://example.com',
      debug: true,
    },
    200,
  );

  await mockClient.ALL(
    {
      url: 'https://example.com/foo',
      debug: true,
    },
    200,
  );

  await mockClient.GET(
    {
      url: 'https://example.com/',
      debug: true,
    },
    200,
  );

  const res = await fetch('https://example.com/');
  expect(res.status).toBe(200);

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
