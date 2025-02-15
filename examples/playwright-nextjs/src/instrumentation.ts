import { headers } from 'next/headers';
import { mockHandler } from 'mock-server-request';

export function register() {
  if (process.env.NODE_ENV !== 'production') {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const inboundHeaders = await headers();
      const outboundReq = new Request(input, init);
      const mockedResponse = mockHandler(inboundHeaders, outboundReq);
      return mockedResponse || originalFetch(input, init);
    };
  }
}
