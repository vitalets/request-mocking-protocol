import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import node from '@astrojs/node';
import { AsyncLocalStorage } from 'async_hooks';
import type { IncomingHttpHeaders } from 'node:http';
import { tryMock } from 'mock-server-request';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [getMockServerRequest()],
});

function getMockServerRequest(): AstroIntegration {
  return {
    name: 'mockServerRequest',
    hooks: {
      'astro:server:setup': async ({ server }) => {
        if (process.env.NODE_ENV !== 'production') {
          // store inbound headers to be used in the fetch interceptor
          const headersStore = new AsyncLocalStorage<IncomingHttpHeaders>();
          server.middlewares.use((req, _res, next) => {
            headersStore.run(req.headers, next);
          });

          // intercept outbound fetch requests
          const originalFetch = globalThis.fetch;
          globalThis.fetch = async (input, init) => {
            const outboundReq = new Request(input, init);
            const mockedResponse = tryMock(outboundReq, headersStore.getStore());
            return mockedResponse || originalFetch(input, init);
          };
        }
      },
    },
  };
}
