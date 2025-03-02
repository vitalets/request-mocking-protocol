/**
 * Global fetch interceptor.
 */

import { matchSchemas } from '../request-matcher/utils';
import { BaseResponseBuilder } from '../response-builder';
import { extractMockSchemas, GetHeaders } from '../transport';

export function setupFetchInterceptor(getInboundHeaders: GetHeaders) {
  const originalFetch = globalThis.fetch;

  class FetchResponseBuilder extends BaseResponseBuilder {
    protected bypassReq(req: Request) {
      return originalFetch(req);
    }
  }

  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const mockSchemas = await extractMockSchemas(getInboundHeaders);
    const matchResult = await matchSchemas(request, mockSchemas);
    const mockedResponse = matchResult && new FetchResponseBuilder(matchResult).build();
    return mockedResponse || originalFetch(input, init);
  };
}
