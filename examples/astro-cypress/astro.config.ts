import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import node from '@astrojs/node';
import { AsyncLocalStorage } from 'async_hooks';
import type { IncomingHttpHeaders } from 'node:http';
import { setupServer } from 'msw/node';
import { createHandler } from 'mock-server-request/msw';

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

          // setup MSW server
          const mswServer = setupServer(createHandler(() => headersStore.getStore()));
          mswServer.listen();
        }
      },
    },
  };
}
