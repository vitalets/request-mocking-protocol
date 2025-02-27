import { test, expect } from 'vitest';
import { buildMockHeaders, extractMockSchemas } from '../src/transport';
import { MockSchema } from '../src/protocol';

test('buildMockHeaders', () => {
  const headers = buildMockHeaders([
    {
      reqSchema: { url: 'https://example.com', method: 'GET', patternType: 'urlpattern' },
      resSchema: { status: 200, body: 'hello' },
    },
  ]);

  expect(JSON.parse(headers['x-mock-request'])).toEqual([
    {
      reqSchema: {
        method: 'GET',
        patternType: 'urlpattern',
        url: 'https://example.com',
      },
      resSchema: {
        body: 'hello',
        status: 200,
      },
    },
  ]);
});

test('extractMockSchemas', async () => {
  const headersValue: MockSchema[] = [
    {
      reqSchema: {
        method: 'GET',
        patternType: 'urlpattern',
        url: 'https://example.com',
      },
      resSchema: {
        body: 'hello',
        status: 200,
      },
    },
  ];

  const getHeaders = () => {
    return {
      ['x-mock-request']: JSON.stringify(headersValue),
    };
  };

  expect(await extractMockSchemas(getHeaders)).toEqual([
    {
      reqSchema: {
        method: 'GET',
        patternType: 'urlpattern',
        url: 'https://example.com',
      },
      resSchema: {
        body: 'hello',
        status: 200,
      },
    },
  ]);
});
