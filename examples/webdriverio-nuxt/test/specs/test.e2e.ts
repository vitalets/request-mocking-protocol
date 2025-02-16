import { browser, $, expect } from '@wdio/globals';

describe('homepage', () => {
  it('should show users', async () => {
    await browser.url('/');
    await expect($('li')).toHaveText('Leanne Graham');
  });
});
