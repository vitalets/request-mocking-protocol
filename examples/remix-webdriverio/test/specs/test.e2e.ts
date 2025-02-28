import { browser, $, expect } from '@wdio/globals';
import { mockRemoteRequest } from 'request-mocking-protocol';

describe('homepage', () => {
  it('should show users', async () => {
    const mockRemoteRequest = new mockRemoteRequest();
    mockRemoteRequest.addMock('https://jsonplaceholder.typicode.com/users', {
      body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
    });

    await browser.url('/', { headers: mockRemoteRequest.headers });

    await expect($('li')).toHaveText('John Smith');
  });
});
