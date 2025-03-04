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
    await mockClient.GET('https://jsonplaceholder.typicode.com/users/1', {
      body: { id: 1, name: 'John Smith' },
    });

    const { body } = await makeRequest('https://jsonplaceholder.typicode.com/users/1');

    expect(body).toEqual({ id: 1, name: 'John Smith' });
    // expect(res.headers.get('content-type')).toEqual('application/json');
  });

  test('patch response', async () => {
    await mockClient.GET('https://jsonplaceholder.typicode.com/users/1', {
      bodyPatch: {
        'address.city': 'New York',
      },
    });

    const { body } = await makeRequest('https://jsonplaceholder.typicode.com/users/1');
    expect(body.address.city).toEqual('New York');
    // for some reason msw strips headers :(
    // expect(res.headers.get('content-type')).toEqual('application/json; charset=utf-8');
  });

  test('patch request', async () => {
    await mockClient.GET('https://jsonplaceholder.typicode.com/users/2', {
      request: {
        url: 'https://jsonplaceholder.typicode.com/users/1',
      },
    });

    const { body } = await makeRequest('https://jsonplaceholder.typicode.com/users/2');

    expect(body.name).toEqual('Leanne Graham');
    // expect(res.headers.get('content-type')).toEqual('application/json; charset=utf-8');
  });

  test('params substitution (URL pattern)', async () => {
    await mockClient.GET('https://jsonplaceholder.typicode.com/users/:id', {
      headers: {
        'x-custom-header': '{{ id }}',
      },
      body: {
        id: '{{ id:number }}',
        name: 'User {{ id }}',
      },
    });

    const { body } = await makeRequest('https://jsonplaceholder.typicode.com/users/1');
    expect(body).toEqual({ id: 1, name: 'User 1' });
    // expect(res.headers.get('x-custom-header')).toEqual('1');
  });

  test('params substitution (regexp)', async () => {
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
