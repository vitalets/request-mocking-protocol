import { test, expect } from 'vitest';
import { MockServerRequest } from '../src';

test('headers', () => {
  const msr = new MockServerRequest();

  msr.addMock('https://example.com', {
    body: 'hello1',
  });

  expect(JSON.parse(msr.headers['x-mock-request'] || '')).toEqual([
    { reqSchema: 'https://example.com', resSchema: { body: 'hello1' } },
  ]);

  msr.addMock('https://example.com/*', {
    body: 'hello2',
  });

  expect(JSON.parse(msr.headers['x-mock-request'] || '')).toEqual([
    { reqSchema: 'https://example.com', resSchema: { body: 'hello1' } },
    { reqSchema: 'https://example.com/*', resSchema: { body: 'hello2' } },
  ]);
});
