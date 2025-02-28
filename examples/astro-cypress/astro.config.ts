import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import node from '@astrojs/node';
import { AsyncLocalStorage } from 'async_hooks';
import type { IncomingHttpHeaders } from 'node:http';
import { setupServer } from 'msw/node';
import { createHandler } from 'request-mocking-protocol/msw';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [requestMocking()],
});

function requestMocking(): AstroIntegration {
  return {
    name: 'requestMocking',
    hooks: {
      'astro:server:setup': async ({ server }) => {
        if (process.env.NODE_ENV !== 'production') {
          // store inbound headers to be used in the fetch interceptor
          const headersStore = new AsyncLocalStorage<IncomingHttpHeaders>();
          server.middlewares.use((req, _res, next) => {
            headersStore.run(req.headers, next);
          });

          // setup MSW server
          const mswServer = setupServer(createHandler(() => headersStore.getStore()));
          mswServer.listen();
        }
      },
    },
  };
}
