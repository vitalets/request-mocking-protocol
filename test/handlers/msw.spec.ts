import { test, expect, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { MockServerRequest } from '../../src';
import { createHandler } from '../../src/handlers/msw';

let inboundHeaders: Record<string, string> = {};

beforeAll(() => {
  const server = setupServer(createHandler(() => inboundHeaders));
  server.listen();
});

test('mock response', async () => {
  const msr = new MockServerRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0]).toEqual({ id: 1, name: 'John Smith' });
});

test('patch response', async () => {
  const msr = new MockServerRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    bodyPatch: {
      '[0].name': 'John Smith',
    },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0].name).toEqual('John Smith');
});
