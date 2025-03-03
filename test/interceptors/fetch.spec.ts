import { test, expect, beforeAll, beforeEach } from 'vitest';
import { MockClient } from '../../src';
import { setupFetchInterceptor } from '../../src/interceptors/fetch';

const mockClient = new MockClient();

beforeAll(() => {
  setupFetchInterceptor(() => mockClient.headers);
});

beforeEach(() => {
  mockClient.reset();
});

test('mock response', async () => {
  await mockClient.GET('https://jsonplaceholder.typicode.com/users/1', {
    body: { id: 1, name: 'John Smith' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1');

  expect(await res.json()).toEqual({ id: 1, name: 'John Smith' });
  expect(res.headers.get('content-type')).toContain('application/json');
});

test('patch response', async () => {
  await mockClient.GET('https://jsonplaceholder.typicode.com/users/1', {
    bodyPatch: {
      'address.city': 'New York',
    },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1');

  expect((await res.json()).address.city).toEqual('New York');
  expect(res.headers.get('content-type')).toContain('application/json');
});
