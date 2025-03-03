/**
 * Playwright interceptor.
 * Used in Playwright tests to mock page requests with the same syntax as for server requests.
 */

import { Page, BrowserContext, Request as PwRequest, APIResponse } from '@playwright/test';
import { matchSchemas } from '../request-matcher/utils';
import { ResponseBuilder, ResponseLike } from '../response-builder';
import { MockClient } from '../client';

export async function setupPlaywrightInterceptor(
  page: Page | BrowserContext,
  mockClient: MockClient,
) {
  await page.route('**', async (route) => {
    const request = buildFetchRequest(route.request());
    const matchResult = await matchSchemas(request, mockClient.schemas);
    if (!matchResult) return route.fallback();

    const { body, status, headers } = await new ResponseBuilder(matchResult, {
      bypass: async () => buildResponseLike(await route.fetch()),
    }).build();

    const headersObj = Object.fromEntries(headers.entries());
    const finalBody = body instanceof ArrayBuffer ? Buffer.from(body) : body;

    await route.fulfill({ body: finalBody ?? undefined, status, headers: headersObj });
  });
}

function buildFetchRequest(pwRequest: PwRequest) {
  return new Request(pwRequest.url(), {
    method: pwRequest.method(),
    headers: pwRequest.headers(),
    body: pwRequest.postDataBuffer(),
  });
}

function buildResponseLike(pwResponse: APIResponse): ResponseLike {
  return {
    status: pwResponse.status(),
    headers: new Headers(pwResponse.headers()),
    arrayBuffer: () => pwResponse.body(),
    json: () => pwResponse.json(),
  };
}
