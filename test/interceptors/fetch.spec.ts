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
    body: [{ id: 1, name: 'John Smith' }],
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual([{ id: 1, name: 'John Smith' }]);
});

test('patch response', async () => {
  await mockClient.GET('https://jsonplaceholder.typicode.com/users', {
    bodyPatch: {
      '[0].name': 'John Smith',
    },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0].name).toEqual('John Smith');
});
