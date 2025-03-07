import { browser, $, expect } from '@wdio/globals';
import { MockClient } from 'request-mocking-protocol';

describe('homepage', () => {
  it('should show users', async () => {
    const mockClient = new MockClient();
    mockClient.addMock('https://jsonplaceholder.typicode.com/users', {
      body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
    });

    await browser.url('/', { headers: mockClient.headers });

    await expect($('li')).toHaveText('John Smith');
  });
});
