import { test, expect } from 'vitest';
import { MockClient } from '../src';

export type SimpleRequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export type MakeRequestResult = ReturnType<typeof makeRequestDefault>;

async function makeRequestDefault(input: string, init?: SimpleRequestInit) {
  const res = await fetch(input, init);
  const headers = Object.fromEntries(res.headers.entries());
  const bodyStr = await res.text();
  const body = bodyStr ? JSON.parse(bodyStr) : undefined;
  return { status: res.status, headers, body, bodyStr };
}

export function createTestCases(mockClient: MockClient, makeRequest = makeRequestDefault) {
  test('mock response', async () => {
    await mockClient.GET('https://jsonplaceholder.typicode.com/users/:id', {
      body: {
        id: 1,
        name: 'John Smith',
        username: 'User {{ id }}',
        phone: '{{ id:number }}',
      },
      headers: {
        'x-custom-header': '{{ id }}',
        'access-control-expose-headers': 'x-custom-header',
      },
    });

    const { body, headers } = await makeRequest('https://jsonplaceholder.typicode.com/users/1');

    expect(body).toEqual({ id: 1, name: 'John Smith', username: 'User 1', phone: 1 });
    expect(headers['content-type']).toEqual('application/json');
    expect(headers['x-custom-header']).toEqual('1');
  });

  test('patch response', async () => {
    // use real server to get real-world headers
    await mockClient.GET('https://jsonplaceholder.typicode.com/users/:id', {
      bodyPatch: {
        'address.city': 'New York',
        username: 'User {{ id }}',
        phone: '{{ id:number }}',
      },
      headers: {
        'x-custom-header': '{{ id }}',
        'access-control-expose-headers': 'x-custom-header',
      },
    });

    const { body, headers } = await makeRequest('https://jsonplaceholder.typicode.com/users/1');

    expect(body.address.city).toEqual('New York');
    expect(body.username).toEqual('User 1');
    expect(body.phone).toEqual(1);
    expect(headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(headers['x-custom-header']).toEqual('1');
  });

  test('patch request', async () => {
    await mockClient.GET('https://jsonplaceholder.typicode.com/users/2', {
      request: {
        url: 'https://jsonplaceholder.typicode.com/users/1',
      },
    });

    const { body, headers } = await makeRequest('https://jsonplaceholder.typicode.com/users/2');

    expect(body.name).toEqual('Leanne Graham');
    expect(headers['content-type']).toEqual('application/json; charset=utf-8');
  });

  test('url as regexp', async () => {
    await mockClient.GET(/https:\/\/jsonplaceholder\.typicode\.com\/users\/(?<id>[^/]+)/, {
      body: {
        id: '{{ id:number }}',
        name: 'User {{ id }}',
      },
    });

    const { body } = await makeRequest('https://jsonplaceholder.typicode.com/users/1');
    expect(body).toEqual({ id: 1, name: 'User 1' });
  });

  test('params substitution (request)', async () => {
    await mockClient.GET('https://example.com/:id', {
      request: {
        url: 'https://jsonplaceholder.typicode.com/users/{{id}}',
      },
    });

    const { body } = await makeRequest('https://example.com/1');
    expect(body.name).toEqual('Leanne Graham');
  });
}
