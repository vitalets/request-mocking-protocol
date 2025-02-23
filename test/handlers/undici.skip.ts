// Keeping this file as a reference for undici handler implementation
/*
import { test, expect, beforeAll } from 'vitest';
import { Dispatcher, getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import { MockServerRequest, tryMock } from '../../src';

let inboundHeaders: Record<string, string> = {};

beforeAll(() => {
  mockUndiciGlobalDispatcher(() => inboundHeaders);
});

test('mock response', async () => {
  const msr = new MockServerRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0]).toEqual({ id: 1, name: 'John Smith' });
});

// Undici: patching does not work, as secondary fetch() does not attach bypass header
// todo: investigate
test.skip('patch response', async () => {
  const msr = new MockServerRequest();
  msr.onChange = (headers) => (inboundHeaders = headers);

  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    bodyPatch: {
      '[0].name': 'John Smith',
    },
  });

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0].name).toEqual('John Smith');
});

function mockUndiciGlobalDispatcher(getHeaders: () => Record<string, string>) {
  const dispatcherWithMocks = getGlobalDispatcher().compose((dispatch) => (opts, handler) => {
    const outboundReq = convertUndiciOptionsToRequest(opts);
    if (!outboundReq) return dispatch(opts, handler);
    const inboundHeaders = getHeaders();
    // console.log('try mock', outboundReq.url, [...outboundReq.headers.entries()]);
    tryMock(outboundReq, inboundHeaders).then((mockedResponse) => {
      return mockedResponse
        ? convertResponseToUndici(mockedResponse, handler)
        : dispatch(opts, handler);
    });

    return true;
  });

  setGlobalDispatcher(dispatcherWithMocks);
}

function convertUndiciOptionsToRequest(opts: Dispatcher.DispatchOptions) {
  const { origin, body } = opts;
  if (!origin) return;
  // todo: handle other body types
  if (body && typeof body !== 'string') return;
  const url = new URL(origin);
  url.pathname = opts.path;
  // todo: handle query
  return new Request(url, {
    method: opts.method,
    // todo: headers
    // headers: opts.headers ?? {},
    body,
  });
}

async function convertResponseToUndici(res: Response, handler: Dispatcher.DispatchHandler) {
  const buffer = await res.arrayBuffer();
  // all handlers must be defined!
  // todo: replace deprecated methods
  // See: https://github.com/nodejs/undici/blob/main/lib/mock/mock-utils.js#L318
  handler.onConnect?.(() => {});
  // todo: add headers
  handler.onHeaders?.(res.status, [], () => {}, 'getStatusText(statusCode)');
  handler.onData?.(Buffer.from(buffer));
  handler.onComplete?.([]);
  return true;
}
*/
