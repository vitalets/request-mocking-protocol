import { test, expect } from 'vitest';
import { Dispatcher, getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import { MockServerRequest, tryMock } from '../../src';

test('mock undici global dispatcher', async () => {
  const msr = new MockServerRequest();
  await msr.addMock('https://jsonplaceholder.typicode.com/users', {
    body: JSON.stringify([{ id: 1, name: 'John Smith' }]),
  });

  mockUndiciGlobalDispatcher(() => msr.headers);

  const res = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  expect(res[0]).toEqual({ id: 1, name: 'John Smith' });
});

function mockUndiciGlobalDispatcher(getHeaders: () => Record<string, string>) {
  const dispatcherWithMocks = getGlobalDispatcher().compose((dispatch) => (opts, handler) => {
    const outboundReq = convertUndiciOptionsToRequest(opts);
    if (!outboundReq) return dispatch(opts, handler);
    const inboundHeaders = getHeaders();

    const mockedResponse = tryMock(outboundReq, inboundHeaders);
    if (mockedResponse) {
      convertResponseToUndici(mockedResponse, handler);
      return true;
    } else {
      return dispatch(opts, handler);
    }
  });

  setGlobalDispatcher(dispatcherWithMocks);
}

/**
 * Convert undici dispatch optioins to Fetch Request
 */
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

/**
 * Convert Fetch Response to undici response
 */
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
}
