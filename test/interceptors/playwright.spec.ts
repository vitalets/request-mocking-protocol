import { beforeAll, beforeEach, afterAll } from 'vitest';
import { Browser, BrowserContext, chromium, Page } from 'playwright';
import { MockClient } from '../../src';
import { setupPlaywrightInterceptor } from '../../src/interceptors/playwright';
import { createTestCases, MakeRequestResult, SimpleRequestInit } from './test-cases';

const mockClient = new MockClient();

let browser: Browser;
let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch();
  context = await browser.newContext();
});

beforeEach(async () => {
  await mockClient.reset();
  page = await context.newPage();
  await setupPlaywrightInterceptor(page, mockClient);
});

afterAll(async () => {
  await context.close();
  await context.close();
});

createTestCases(mockClient, makeRequestFromPage);

async function makeRequestFromPage(input: string, init?: SimpleRequestInit) {
  await page.goto('https://example.com');
  return page.evaluate<MakeRequestResult, [string, SimpleRequestInit | undefined]>(
    async ([input, init]) => {
      const res = await fetch(input, init);
      const headers = Object.fromEntries(res.headers.entries());
      const bodyStr = await res.text();
      const body = bodyStr ? JSON.parse(bodyStr) : undefined;
      return { status: res.status, headers, body, bodyStr };
    },
    [input, init],
  );
}
