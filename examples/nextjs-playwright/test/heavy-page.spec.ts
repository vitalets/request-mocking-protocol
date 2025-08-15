/**
 * Example test for server-side caching using RMP.
 */
import { expect, Page } from '@playwright/test';
import { MockClient } from 'request-mocking-protocol';
import { test } from './fixtures';

let serverSideResponse: string | null = null;

async function loadHeavyPage(page: Page, mockServerRequest: MockClient) {
  // 1. If serverSideResponse is ppopulated, use it to mock server-side request and load page faster
  if (serverSideResponse) {
    await mockServerRequest.GET('https://httpbin.org/delay/*', {
      body: JSON.parse(serverSideResponse),
    });
  }

  // 2. Load the page
  await page.goto('/heavy-page');

  // 3. If usersResponse is not ppopulated, extract users response from HTML
  if (!serverSideResponse) {
    serverSideResponse = await page.locator('#data-response').textContent();
    if (!serverSideResponse) throw new Error('Users response is not found in HTML');
  }
}

test('heavy-page test 1', async ({ page, mockServerRequest }) => {
  // This is the first page load, will not mock server request
  await loadHeavyPage(page, mockServerRequest);

  await expect(page.getByRole('listitem')).toContainText(['httpbin.org']);
});

test('heavy-page test 2', async ({ page, mockServerRequest }) => {
  // This page will load faster, because it uses the cached response on server
  await loadHeavyPage(page, mockServerRequest);

  await expect(page.getByRole('listitem')).toContainText(['httpbin.org']);
});

test('heavy-page test 3', async ({ page, mockServerRequest }) => {
  // This page will load faster, because it uses the cached response on server
  await loadHeavyPage(page, mockServerRequest);

  await expect(page.getByRole('listitem')).toContainText(['httpbin.org']);
});
