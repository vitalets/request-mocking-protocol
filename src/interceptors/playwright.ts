/**
 * Playwright interceptor.
 * Used in Playwright tests to mock page requests with the same syntax as for server requests.
 */

import { Page, BrowserContext, Request as PwRequest, Route } from '@playwright/test';
import { matchSchemas } from '../request-matcher';
import { ResponseBuilder } from '../response-builder';
import { MockClient } from '../client';

const interceptedTargets = new WeakSet<Page | BrowserContext>();

export async function setupPlaywrightInterceptor(
  page: Page | BrowserContext,
  mockClient: MockClient,
) {
  if (interceptedTargets.has(page)) return;

  await page.route('**', async (route) => {
    const request = buildFetchRequest(route.request());
    const matchResult = await matchSchemas(request, mockClient.schemas);
    if (!matchResult) return route.fallback();

    const { body, headers, status } = await new ResponseBuilder(matchResult, {
      bypass: (req) => bypass(req, route),
    }).build();

    await route.fulfill({
      status,
      headers: Object.fromEntries(headers),
      body: body instanceof ArrayBuffer ? Buffer.from(body) : (body ?? undefined),
      // route.fulfill() doesn't accept statusText
    });
  });

  interceptedTargets.add(page);
}

function buildFetchRequest(pwRequest: PwRequest) {
  const postData = pwRequest.postDataBuffer();
  return new Request(pwRequest.url(), {
    method: pwRequest.method(),
    headers: pwRequest.headers(),
    body: postData ? Uint8Array.from(postData) : undefined,
  });
}

async function bypass(req: Request, route: Route) {
  const pwResponse = await route.fetch({
    url: req.url,
    headers: Object.fromEntries(req.headers),
    postData: req.body ? Buffer.from(await req.arrayBuffer()) : undefined,
  });

  return {
    status: pwResponse.status(),
    statusText: pwResponse.statusText(),
    headers: new Headers(pwResponse.headers()),
    arrayBuffer: async () => Uint8Array.from(await pwResponse.body()).buffer,
    json: () => pwResponse.json(),
  };
}
