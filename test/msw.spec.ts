import { beforeAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { MockClient } from '../src';
import { createHandler } from '../src/interceptors/msw';
import { createTestCases } from './test-cases';

const mockClient = new MockClient();

beforeAll(() => {
  const server = setupServer(createHandler(() => mockClient.headers));
  server.listen();
});

beforeEach(async () => {
  await mockClient.reset();
});

createTestCases(mockClient);
