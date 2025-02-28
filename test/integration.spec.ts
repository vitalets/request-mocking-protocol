import { test, expect, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { MockRemoteRequest } from '../src';
import { createHandler } from '../src/interceptors/msw';

let inboundHeaders: Record<string, string> = {};

beforeAll(() => {
  const server = setupServer(createHandler(() => inboundHeaders));
  server.listen();
});

test('mock response', async () => {
  const msr = new MockRemoteRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.GET('https://jsonplaceholder.typicode.com/users/1', {
    body: { id: 1, name: 'John Smith' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual({ id: 1, name: 'John Smith' });
});

test('patch response', async () => {
  const msr = new MockRemoteRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.GET('https://jsonplaceholder.typicode.com/users', {
    bodyPatch: {
      '[0].name': 'John Smith',
    },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0].name).toEqual('John Smith');
});

test('route params substitution (URL pattern)', async () => {
  const msr = new MockRemoteRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.GET('https://jsonplaceholder.typicode.com/users/:id', {
    body: { id: '{{ id:number }}', name: 'User {{ id }}' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual({ id: 1, name: 'User 1' });
});

test('route params substitution (regexp)', async () => {
  const msr = new MockRemoteRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.GET(/https:\/\/jsonplaceholder\.typicode\.com\/users\/(?<id>[^/]+)/, {
    body: { id: '{{ id:number }}', name: 'User {{ id }}' },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users/1').then((r) => r.json());
  expect(res).toEqual({ id: 1, name: 'User 1' });
});
