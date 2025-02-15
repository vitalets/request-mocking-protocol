import { test as base } from '@playwright/test';
import { MockServerRequest } from 'mock-server-request';

export const test = base.extend<{ mockServerRequest: MockServerRequest }>({
  mockServerRequest: async ({ context }, use) => {
    const mockServerRequest = new MockServerRequest();
    mockServerRequest.onChange = async (headers) => context.setExtraHTTPHeaders(headers);
    await use(mockServerRequest);
  },
});
