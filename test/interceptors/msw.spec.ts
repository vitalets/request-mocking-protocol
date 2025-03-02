import { test, expect, beforeAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { MockClient } from '../../src';
import { createHandler } from '../../src/interceptors/msw';

const mockClient = new MockClient();

beforeAll(() => {
  const server = setupServer(createHandler(() => mockClient.headers));
  server.listen();
});

beforeEach(() => {
  mockClient.reset();
});

test('mock response', async () => {
  await mockClient.GET('https://jsonplaceholder.typicode.com/users/1', {
    body: { id: 1, name: 'John Smith' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual({ id: 1, name: 'John Smith' });
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

test('route params substitution (URL pattern)', async () => {
  await mockClient.GET('https://jsonplaceholder.typicode.com/users/:id', {
    body: { id: '{{ id:number }}', name: 'User {{ id }}' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual({ id: 1, name: 'User 1' });
});

test('route params substitution (regexp)', async () => {
  await mockClient.GET(/https:\/\/jsonplaceholder\.typicode\.com\/users\/(?<id>[^/]+)/, {
    body: { id: '{{ id:number }}', name: 'User {{ id }}' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual({ id: 1, name: 'User 1' });
});
