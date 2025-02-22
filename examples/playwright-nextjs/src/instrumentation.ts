import { headers } from 'next/headers';

export async function register() {
  if (process.env.NODE_ENV !== 'production') {
    const { tryMock } = await import('mock-server-request');

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const outboundReq = new Request(input, init);
      const mockedResponse = tryMock(outboundReq, await headers());
      return mockedResponse || originalFetch(input, init);
    };
  }
}
