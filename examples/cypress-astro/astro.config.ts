// @ts-check
import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import node from '@astrojs/node';
import { AsyncLocalStorage } from 'async_hooks';
import type { IncomingHttpHeaders } from 'node:http';

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
          const { setupMockServerRequest } = await import('mock-server-request');

          const headersStorage = new AsyncLocalStorage<IncomingHttpHeaders>();
          server.middlewares.use((req, _res, next) => {
            headersStorage.run(req.headers, next);
          });

          setupMockServerRequest(() => headersStorage.getStore());
        }
      },
    },
  };
}
