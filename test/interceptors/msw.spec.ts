import { test, expect } from 'vitest';
import { http, passthrough } from 'msw';
import { setupServer } from 'msw/node';
import { MockServerRequest, tryMock } from '../../src';

test('mock via msw', async () => {
  const msr = new MockServerRequest();
  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
  });

  setupMswHandler(() => msr.headers);

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0]).toEqual({ id: 1, name: 'John Smith' });
});

function setupMswHandler(getHeaders: () => Record<string, string>) {
  const server = setupServer(
    http.get('*', ({ request }) => {
      const inboundHeaders = getHeaders();
      const mockedResponse = tryMock(request, inboundHeaders);
      return mockedResponse || passthrough();
    }),
  );
  server.listen();
}
