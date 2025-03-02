/**
 * Global fetch interceptor.
 */

import { matchSchemas } from '../request-matcher/utils';
import { buildMockResponse } from '../response-builder';
import { extractMockSchemas, GetHeaders } from '../transport';

export function setupFetchInterceptor(getInboundHeaders: GetHeaders) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const mockSchemas = await extractMockSchemas(getInboundHeaders);
    const matchResult = await matchSchemas(request, mockSchemas);
    if (!matchResult) return originalFetch(input, init);

    const { body, status, headers } = await buildMockResponse(matchResult, {
      bypass: (req) => originalFetch(req),
    });

    return new Response(body, { status, headers });
  };
}
