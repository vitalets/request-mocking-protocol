/**
 * MSW interceptor.
 */
import { http, bypass, HttpResponse } from 'msw';
import { extractMockSchemas, GetHeaders } from '../transport';
import { matchSchemas } from '../request-matcher/utils';
import { ResponseBuilder } from '../response-builder';

export function createHandler(getInboundHeaders: GetHeaders) {
  return http.all('*', async ({ request }) => {
    const mockSchemas = await extractMockSchemas(getInboundHeaders);
    const matchResult = await matchSchemas(request, mockSchemas);
    if (!matchResult) return;

    const { body, headers, status, statusText } = await new ResponseBuilder(matchResult, {
      bypass: (req) => fetch(bypass(req)),
    }).build();

    return new HttpResponse(body, { status, statusText, headers });
  });
}
