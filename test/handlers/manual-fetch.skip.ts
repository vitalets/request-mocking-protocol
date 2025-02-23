// Keeping this file as a reference for global fetch interceptor implementation
/*
import { test, expect, beforeAll } from 'vitest';
import { MockServerRequest, tryMock } from '../../src';

let inboundHeaders: Record<string, string> = {};

beforeAll(() => {
  mockGlobalFetch(() => inboundHeaders);
});

test('mock response', async () => {
  const msr = new MockServerRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    body: [{ id: 1, name: 'John Smith' }],
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

function mockGlobalFetch(getHeaders: () => Record<string, string>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const inboundHeaders = getHeaders();
    const outboundReq = new Request(input, init);
    const mockedResponse = await tryMock(outboundReq, inboundHeaders);
    return mockedResponse || originalFetch(input, init);
  };
}
*/
