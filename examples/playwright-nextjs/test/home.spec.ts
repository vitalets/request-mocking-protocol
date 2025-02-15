import { expect } from '@playwright/test';
import { test } from './fixtures';

test('show show users on the homepage', async ({ page, mockServerRequest }) => {
  await mockServerRequest.addMock('https://jsonplaceholder.typicode.com/users', {
    body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
  });
  await page.goto('/');
  await expect(page.getByRole('listitem')).toHaveText(['John Smith']);
});
