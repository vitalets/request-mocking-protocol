import { test, expect } from 'vitest';
import { MockServerRequest, tryMock } from '../../src';

test('mock global fetch', async () => {
  const msr = new MockServerRequest();
  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
  });

  mockGlobalFetch(() => msr.headers);

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0]).toEqual({ id: 1, name: 'John Smith' });
});

function mockGlobalFetch(getHeaders: () => Record<string, string>) {
  // overwrite global fetch
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const outboundReq = new Request(input, init);
    const inboundHeaders = getHeaders();
    const mockedResponse = tryMock(outboundReq, inboundHeaders);
    return mockedResponse || originalFetch(input, init);
  };
}
