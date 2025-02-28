import { expect } from '@playwright/test';
import { test } from './fixtures';

test('show show users on the homepage', async ({ page, mockRemoteRequest }) => {
  await mockRemoteRequest.GET('https://jsonplaceholder.typicode.com/users', {
    body: [{ id: 1, name: 'John Smith' }],
  });
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveText(['John Smith']);
});
