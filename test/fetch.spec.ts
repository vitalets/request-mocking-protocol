import { beforeAll, beforeEach, expect, test } from 'vitest';
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

// -- extra tests --

test('does not apply fetch interceptor twice', () => {
  const patchedFetch = globalThis.fetch;
  setupFetchInterceptor(() => mockClient.headers);
  expect(globalThis.fetch).toBe(patchedFetch);
});
