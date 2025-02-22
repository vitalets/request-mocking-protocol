import { Dispatcher, getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import { tryMock } from 'mock-server-request';

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Nitro plugin init');

    // For Nuxt mocking globalThis.fetch does not intercept all requests,
    // need to use getGlobalDispatcher / setGlobalDispatcher from undici.
    // Todo: investigate why sometime there is an error: "[unhandledRejection] write EPIPE"
    mockUndiciGlobalDispatcher(() => getRequestHeaders(useEvent()));
  }
});

function mockUndiciGlobalDispatcher(getHeaders: () => Record<string, string | undefined>) {
  // Node.js >= v22
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
 * Notice typing: Dispatcher.DispatchHandlers vs Dispatcher.DispatchHandler
 */
async function convertResponseToUndici(res: Response, handler: Dispatcher.DispatchHandlers) {
  const buffer = await res.arrayBuffer();
  // all handlers must be defined!
  // todo: replace deprecated methods
  // See: https://github.com/nodejs/undici/blob/main/lib/mock/mock-utils.js#L318
  handler.onConnect?.(() => {});
  // todo: add headers
  handler.onHeaders?.(res.status, [], () => {}, 'OK');
  handler.onData?.(Buffer.from(buffer));
  handler.onComplete?.([]);
}
