/**
 * MSW adapter for matching and resolving requests on the remote end (server).
 */
import { http, bypass, HttpResponse } from 'msw';
import { extractMockSchemas, GetHeaders } from '../transport';
import { findMatchedSchema } from '../request-matcher/utils';
import { BaseResponseBuilder } from '../response-builder';

// createMockHandler
export function createHandler(getInboundHeaders: GetHeaders) {
  return http.all('*', async ({ request }) => {
    const mockSchemas = await extractMockSchemas(getInboundHeaders);
    const matchedSchema = findMatchedSchema(request, mockSchemas);
    if (matchedSchema) {
      return new MswResponseBuilder(request, matchedSchema.resSchema).build();
    }
  });
}

class MswResponseBuilder extends BaseResponseBuilder {
  protected bypassReq(req: Request) {
    return fetch(bypass(req));
  }

  protected createResponse(body?: string | null, init?: ResponseInit) {
    return new HttpResponse(body, init);
  }
}
