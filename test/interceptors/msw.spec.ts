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
  // todo: fix
  // expect(res.headers.get('content-type')).toContain('application/json');
});

test('patch request', async () => {
  await mockClient.GET('https://jsonplaceholder.typicode.com/users/2', {
    request: {
      url: 'https://jsonplaceholder.typicode.com/users/1',
    },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/2');

  expect((await res.json()).name).toEqual('Leanne Graham');
});

test('route params substitution (URL pattern)', async () => {
  await mockClient.GET('https://jsonplaceholder.typicode.com/users/:id', {
    body: {
      id: '{{ id:number }}',
      name: 'User {{ id }}',
    },
    headers: {
      'x-custom-header': '{{ id }}',
    },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
  expect(await res.json()).toEqual({ id: 1, name: 'User 1' });
  expect(res.headers.get('x-custom-header')).toEqual('1');
});

test('route params substitution (regexp)', async () => {
  await mockClient.GET(/https:\/\/jsonplaceholder\.typicode\.com\/users\/(?<id>[^/]+)/, {
    body: { id: '{{ id:number }}', name: 'User {{ id }}' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual({ id: 1, name: 'User 1' });
});
