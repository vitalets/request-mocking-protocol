/**
 * Playwright interceptor.
 * Used in Playwright tests to mock page requests with the same syntax as for server requests.
 */

import { Page, BrowserContext, Request as PwRequest, Route } from '@playwright/test';
import { matchSchemas } from '../request-matcher/utils';
import { ResponseBuilder } from '../response-builder';
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
      bypass: (req) => bypass(req, route),
    }).build();

    await route.fulfill({
      status,
      headers: Object.fromEntries(headers),
      body: body instanceof ArrayBuffer ? Buffer.from(body) : (body ?? undefined),
    });
  });
}

function buildFetchRequest(pwRequest: PwRequest) {
  return new Request(pwRequest.url(), {
    method: pwRequest.method(),
    headers: pwRequest.headers(),
    body: pwRequest.postDataBuffer(),
  });
}

async function bypass(req: Request, route: Route) {
  const pwResponse = await route.fetch({
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    postData: req.body ? Buffer.from(await req.arrayBuffer()) : undefined,
  });

  return {
    status: pwResponse.status(),
    headers: new Headers(pwResponse.headers()),
    arrayBuffer: () => pwResponse.body(),
    json: () => pwResponse.json(),
  };
}
