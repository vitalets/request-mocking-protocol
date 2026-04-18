/**
 * Global fetch interceptor.
 */

import { matchSchemas } from '../request-matcher';
import { ResponseBuilder } from '../response-builder';
import { extractMockSchemas, GetHeaders } from '../transport';

const fetchInterceptorSymbol = Symbol.for('request-mocking-protocol.fetchInterceptorApplied');

export function setupFetchInterceptor(getIncomingHeaders: GetHeaders) {
  if (Reflect.get(globalThis, fetchInterceptorSymbol)) return;

  Object.defineProperty(globalThis, fetchInterceptorSymbol, {
    value: true,
    configurable: true,
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const mockSchemas = await extractMockSchemas(getIncomingHeaders);
    const matchResult = await matchSchemas(request, mockSchemas);
    if (!matchResult) return originalFetch(input, init);

    const { body, headers, status, statusText } = await new ResponseBuilder(matchResult, {
      bypass: (req) => originalFetch(req),
    }).build();

    return new Response(body, { status, statusText, headers });
  };
}
