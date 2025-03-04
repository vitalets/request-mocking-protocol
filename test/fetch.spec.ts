import { beforeAll, beforeEach } from 'vitest';
import { MockClient } from '../src';
import { setupFetchInterceptor } from '../src/interceptors/fetch';
import { createTestCases } from './test-cases';

const mockClient = new MockClient();

beforeAll(() => {
  setupFetchInterceptor(() => mockClient.headers);
});

beforeEach(async () => {
  await mockClient.reset();
});

createTestCases(mockClient);
