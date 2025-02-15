/**
 * Handler on server side to mock the request.
 */

import { MockSchema } from './mock-schema';
import { RequestPattern } from './request-pattern';

const MOCKING_HEADER = 'x-mock-request';

export function mockHandler(inboundHeaders: Headers, outboundReq: Request) {
  const mockingHeader = inboundHeaders.get(MOCKING_HEADER);
  if (!mockingHeader) return;
  const mockSchemas = JSON.parse(mockingHeader) as MockSchema[];
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
