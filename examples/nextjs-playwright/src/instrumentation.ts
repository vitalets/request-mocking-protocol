import { headers } from 'next/headers';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
    const { setupServer } = await import('msw/node');
    const { createHandler } = await import('request-mocking-protocol/msw');

    const server = setupServer(createHandler(() => headers()));
    server.listen();
  }
}
