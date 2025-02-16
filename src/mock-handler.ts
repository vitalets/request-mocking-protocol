/**
 * Handler on server side to mock the request.
 */

import { MockSchema } from './mock-schema';
import { RequestPattern } from './request-pattern';

const MOCKING_HEADER = 'x-mock-request';

type HeadersLike = Headers | Record<string, string | string[] | undefined>;
type GetHeadersFn = () => HeadersLike | undefined | Promise<HeadersLike | undefined>;

export function setupMockServerRequest(getHeaders: GetHeadersFn) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const outboundReq = new Request(input, init);
    const mockedResponse = await tryMock(outboundReq, getHeaders);
    // todo: debug
    return mockedResponse || originalFetch(input, init);
  };
}

export async function tryMock(outboundReq: Request, getHeaders: GetHeadersFn) {
  const inboundHeaders = toHeaders(await getHeaders());
  const mockSchemas = extractMockSchemas(inboundHeaders);
  if (!mockSchemas?.length) return;
  return applySchemas(outboundReq, mockSchemas);
}

function applySchemas(outboundReq: Request, mockSchemas: MockSchema[]) {
  for (const mockSchema of mockSchemas) {
    const { reqSchema, resSchema } = mockSchema;
    const requestPattern = new RequestPattern(reqSchema);
    if (requestPattern.test(outboundReq)) {
      return new Response(resSchema.body, {
        status: resSchema.status,
        headers: resSchema.headers,
      });
    }
  }
}

function extractMockSchemas(headers: Headers) {
  try {
    const mockingHeader = headers.get(MOCKING_HEADER);
    if (!mockingHeader) return;
    return JSON.parse(mockingHeader) as MockSchema[];
  } catch {
    // do nothing
  }
}

/**
 * Convert object to Headers instance.
 */
function toHeaders(incomingHeaders: HeadersLike = {}) {
  if (incomingHeaders instanceof Headers) return incomingHeaders;

  const headers = new Headers();
  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (Array.isArray(value)) {
      value.forEach((val) => headers.append(key, val));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  return headers;
}
