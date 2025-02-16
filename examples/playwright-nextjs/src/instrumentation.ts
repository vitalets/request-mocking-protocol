import { headers } from 'next/headers';

export async function register() {
  if (process.env.NODE_ENV !== 'production') {
    const { setupMockServerRequest } = await import('mock-server-request');
    setupMockServerRequest(() => headers());
  }
}
