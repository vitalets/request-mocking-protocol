import { test as base } from '@playwright/test';
import { MockRemoteRequest } from 'request-mocking-protocol';

export const test = base.extend<{ mockRemoteRequest: MockRemoteRequest }>({
  mockRemoteRequest: async ({ context }, use) => {
    const mockRemoteRequest = new MockRemoteRequest();
    mockRemoteRequest.onChange = async (headers) => context.setExtraHTTPHeaders(headers);
    await use(mockRemoteRequest);
  },
});
