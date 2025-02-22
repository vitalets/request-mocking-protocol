/**
 * Handler on server side to mock the request.
 */

import { MockSchema, ResponseSchema } from './mock-schema';
import { RequestPattern } from './request-pattern';
import patchObject from 'lodash.set';

const MOCKING_HEADER = 'x-mock-request';
const MOCKING_HEADER_BYPASS = 'x-mock-bypass';

type HeadersLike =
  | Headers
  | Record<string, string | string[] | undefined>
  | Iterable<[string, string | string[] | undefined]>;

// export function setupMockServerRequest(getHeaders: GetHeadersFn) {
//   const originalFetch = globalThis.fetch;
//   globalThis.fetch = async (input, init) => {
//     const outboundReq = new Request(input, init);
//     const mockedResponse = await tryMock(outboundReq, getHeaders);
//     // todo: debug
//     return mockedResponse || originalFetch(input, init);
//   };
// }

export async function tryMock(outboundReq: Request, inboundHeaders?: HeadersLike) {
  if (!inboundHeaders) return;
  if (outboundReq.headers.has(MOCKING_HEADER_BYPASS)) return;

  const headers = toHeaders(inboundHeaders);
  const mockSchemas = extractMockSchemas(headers);
  if (!mockSchemas?.length) return;

  return applySchemas(outboundReq, mockSchemas);
}

async function applySchemas(outboundReq: Request, mockSchemas: MockSchema[]) {
  for (const mockSchema of mockSchemas) {
    const { reqSchema, resSchema } = mockSchema;
    const requestPattern = new RequestPattern(reqSchema);
    if (!requestPattern.test(outboundReq)) continue;
    const { bodyPatch } = resSchema;
    // patch real response
    if (bodyPatch) {
      return patchResponse(outboundReq, bodyPatch);
    } else {
      return mockResponse(resSchema);
    }
  }
}

async function patchResponse(outboundReq: Request, bodyPatch: Record<string, unknown>) {
  const headers = new Headers(outboundReq.headers);
  // add custom header to bypass the mocking
  headers.set(MOCKING_HEADER_BYPASS, 'true');
  // outboundReq.headers.set(MOCKING_HEADER_BYPASS, 'true');
  // const newRequest = new Request(outboundReq.clone());
  // newRequest.headers.set(MOCKING_HEADER_BYPASS, 'true');
  const realResponse = await fetch(outboundReq, { headers });
  // todo: handle other parts of the response
  const body = await realResponse.json();
  Object.keys(bodyPatch).forEach((keyPath) => {
    patchObject(body, keyPath, bodyPatch[keyPath]);
  });
  const bodyStr = JSON.stringify(body);

  // w/o Content-Length header, there is an error: incorrect header check
  const contentLength = bodyStr ? new Blob([bodyStr]).size.toString() : '0';

  return new Response(bodyStr, {
    status: realResponse.status,
    headers: {
      'Content-Length': contentLength,
    },
  });
}

function mockResponse(resSchema: ResponseSchema) {
  const body = typeof resSchema.body === 'object' ? JSON.stringify(resSchema.body) : resSchema.body;
  return new Response(body, {
    status: resSchema.status,
    headers: resSchema.headers,
  });
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
