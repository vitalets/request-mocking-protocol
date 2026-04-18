import { expect, test } from 'vitest';
import { MockClient } from '../src';
import { matchSchemas } from '../src/request-matcher';

test('uses the first registered mock when multiple mocks match the request', async () => {
  const mockClient = new MockClient();

  await mockClient.GET('https://example.com/*', { status: 201 });
  await mockClient.GET('https://example.com/users/*', { status: 202 });

  const matchResult = await matchSchemas(
    new Request('https://example.com/users/1', { method: 'GET' }),
    mockClient.schemas,
  );

  expect(matchResult?.mockSchema.resSchema.status).toBe(201);
});
