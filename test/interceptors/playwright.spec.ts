import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Browser, BrowserContext, chromium } from 'playwright';
import { MockClient } from '../../src';
import { setupPlaywrightInterceptor } from '../../src/interceptors/playwright';

const mockClient = new MockClient();

let browser: Browser;
let context: BrowserContext;

describe.skipIf(!process.env.SLOW)('playwright', () => {
  beforeAll(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
  });

  afterAll(async () => {
    await context.close();
    await context.close();
  });

  beforeEach(() => {
    mockClient.reset();
  });

  test('mock response', async () => {
    const page = await context.newPage();
    await setupPlaywrightInterceptor(page, mockClient);

    await mockClient.GET('https://jsonplaceholder.typicode.com/users', {
      body: [{ id: 1, name: 'John Smith' }],
    });

    await page.goto('https://example.com');
    const res = await page.evaluate(() =>
      fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json()),
    );

    expect(res).toEqual([{ id: 1, name: 'John Smith' }]);
  });

  test('patch response', async () => {
    const page = await context.newPage();
    await setupPlaywrightInterceptor(page, mockClient);

    await mockClient.GET('https://jsonplaceholder.typicode.com/users', {
      bodyPatch: {
        '[0].name': 'John Smith',
      },
    });

    await page.goto('https://example.com');
    const res = await page.evaluate(() =>
      fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json()),
    );

    expect(res[0].name).toEqual('John Smith');
  });
});
