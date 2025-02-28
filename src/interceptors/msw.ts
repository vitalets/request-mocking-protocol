/**
 * MSW adapter for matching and resolving requests on the remote end (server).
 */
import { http, bypass, HttpResponse } from 'msw';
import { extractMockSchemas, GetHeaders } from '../transport';
import { matchSchemas } from '../request-matcher/utils';
import { BaseResponseBuilder } from '../response-builder';

export function createHandler(getInboundHeaders: GetHeaders) {
  return http.all('*', async ({ request }) => {
    const mockSchemas = await extractMockSchemas(getInboundHeaders);
    const matchResult = await matchSchemas(request, mockSchemas);
    if (matchResult) return new MswResponseBuilder(matchResult).build();
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
