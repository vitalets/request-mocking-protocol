import { browser, $, expect } from '@wdio/globals';
import { MockServerRequest } from 'mock-server-request';

describe('homepage', () => {
  it('should show users', async () => {
    const mockServerRequest = new MockServerRequest();
    mockServerRequest.addMock('https://jsonplaceholder.typicode.com/users', {
      body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
    });

    await browser.url('/', { headers: mockServerRequest.headers });

    await expect($('li')).toHaveText('John Smith');
  });
});
