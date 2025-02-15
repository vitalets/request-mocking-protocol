import { test, expect } from 'vitest';
import { RequestPattern } from '../src/request-pattern';

let req: Request;

test('match method', () => {
  const reqPattern = new RequestPattern({ method: 'GET', url: 'https://example.com/' });

  req = new Request('https://example.com');
  expect(reqPattern.test(req)).toEqual(true);

  req = new Request('https://example.com', { method: 'GET' });
  expect(reqPattern.test(req)).toEqual(true);

  req = new Request('https://example.com', { method: 'get' });
  expect(reqPattern.test(req)).toEqual(true);

  req = new Request('https://example.com', { method: 'POST' });
  expect(reqPattern.test(req)).toEqual(false);
});

test('match url: exact', () => {
  const reqPattern = new RequestPattern({ url: 'https://example.com/' });

  req = new Request('https://example.com');
  expect(reqPattern.test(req)).toEqual(true);

  req = new Request('https://example.com/foo');
  expect(reqPattern.test(req)).toEqual(false);
});

test('match url: *', () => {
  const reqPattern = new RequestPattern({ url: 'https://example.com/*' });

  req = new Request('https://example.com');
  expect(reqPattern.test(req)).toEqual(false);

  req = new Request('https://example.com/foo');
  expect(reqPattern.test(req)).toEqual(true);

  // todo: fix with URL normalization
  // req = new Request('https://example.com/foo/');
  // expect(reqPattern.test(req)).toEqual(false);

  req = new Request('https://example.com/foo/bar');
  expect(reqPattern.test(req)).toEqual(false);
});

test('match url: **', () => {
  const reqPattern = new RequestPattern({ url: 'https://example.com/**' });

  req = new Request('https://example.com');
  expect(reqPattern.test(req)).toEqual(true);

  req = new Request('https://example.com/foo');
  expect(reqPattern.test(req)).toEqual(true);

  req = new Request('https://example.com/foo/');
  expect(reqPattern.test(req)).toEqual(true);

  req = new Request('https://example.com/foo/bar');
  expect(reqPattern.test(req)).toEqual(true);
});
