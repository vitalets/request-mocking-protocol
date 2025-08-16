import { expect } from '@playwright/test';
import { test } from './fixtures';

test('show users on the home page', async ({ page, mockServerRequest }) => {
  await mockServerRequest.GET('https://jsonplaceholder.typicode.com/users', {
    body: [{ id: 1, name: 'John Smith' }],
  });

  await page.goto('/');

  await expect(page.getByRole('listitem')).toHaveText(['John Smith']);
});

test('show users on sub page', async ({ page, mockServerRequest }) => {
  await page.goto('/');

  await mockServerRequest.GET('https://jsonplaceholder.typicode.com/users', {
    body: [{ id: 1, name: 'John Smith' }],
  });
  await page.getByRole('link', { name: 'sub page' }).click();

  await expect(page.getByRole('listitem')).toHaveText(['John Smith']);
});
