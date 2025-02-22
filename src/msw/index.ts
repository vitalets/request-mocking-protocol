/**
 * MSW adapter for matching and resolving requests on the remote end (server).
 */
import { http, bypass, HttpResponse } from 'msw';
import { patchObject } from '../utils/patch-object';
import { MockSchema, ResponseSchema } from '../mock-schema';
import { RequestPattern } from '../request-pattern';

const MOCKING_HEADER = 'x-mock-request';

type HeadersLike =
  | Headers
  | Record<string, string | string[] | undefined>
  | Iterable<[string, string | string[] | undefined]>;

type MaybeHeaders = HeadersLike | undefined;

export function createHandler(getInboundHeaders: () => MaybeHeaders | Promise<MaybeHeaders>) {
  return http.all('*', async ({ request }) => {
    const inboundHeaders = await getInboundHeaders();
    if (!inboundHeaders) return;

    const headers = toHeaders(inboundHeaders);
    const mockSchemas = extractMockSchemas(headers);
    if (!mockSchemas?.length) return;

    const mockSchema = findMatchingSchema(request, mockSchemas);
    if (!mockSchema) return;

    return buildResponse(request, mockSchema);
  });
}

function findMatchingSchema(outboundReq: Request, mockSchemas: MockSchema[]) {
  for (const mockSchema of mockSchemas) {
    const { reqSchema } = mockSchema;
    const requestPattern = new RequestPattern(reqSchema);
    if (requestPattern.test(outboundReq)) return mockSchema;
  }
}

async function buildResponse(outboundReq: Request, { resSchema }: MockSchema) {
  const { bodyPatch } = resSchema;
  if (bodyPatch) {
    return patchResponse(outboundReq, bodyPatch);
  } else {
    return mockResponse(resSchema);
  }
}

async function patchResponse(outboundReq: Request, bodyPatch: Record<string, unknown>) {
  const realResponse = await fetch(bypass(outboundReq));
  // todo: support string replacement
  try {
    const body = await realResponse.clone().json();
    patchObject(body, bodyPatch);
    const { status, headers } = realResponse;
    return HttpResponse.json(body, { status, headers });
  } catch {
    return realResponse;
  }
}

function mockResponse({ body, status, headers }: ResponseSchema) {
  const preparedBody = body && typeof body === 'object' ? JSON.stringify(body) : body;
  return new Response(preparedBody, { status, headers });
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
function toHeaders(headersLike: HeadersLike) {
  if (headersLike instanceof Headers) return headersLike;

  const headers = new Headers();
  for (const [key, value] of Object.entries(headersLike)) {
    if (Array.isArray(value)) {
      value.forEach((val) => headers.append(key, val));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  return headers;
}
