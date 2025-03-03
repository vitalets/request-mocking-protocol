/**
 * Schema to match the request.
 */

// serializable
export type MockRequestSchema = {
  url: string;
  patternType?: 'urlpattern' | 'regexp'; // default is 'urlpattern'
  method?: HttpMethod;
  query?: Record<string, string | number | null>;
  headers?: Record<string, string | null>;
  body?: Record<string, unknown> | Array<unknown> | string;
  debug?: boolean;
};

export type MockRequestSchemaInit =
  | string
  | RegExp
  | {
      url: string | RegExp;
      patternType?: MockRequestSchema['patternType'];
      method?: MockRequestSchema['method'];
      query?: MockRequestSchema['query'];
      headers?: MockRequestSchema['headers'];
      body?: MockRequestSchema['body'];
      debug?: MockRequestSchema['debug'];
    };

export function buildMockRequestSchema(init: MockRequestSchemaInit): MockRequestSchema {
  const initObj = toMockRequestSchemaObject(init);
  const { url, ...rest } = initObj;

  if (url instanceof RegExp) rest.patternType = 'regexp';

  // always convert url to string to handle regexp
  const urlStr = url.toString();

  return Object.assign({ url: urlStr }, rest);
}

export function toMockRequestSchemaObject(init: MockRequestSchemaInit) {
  if (!init) throw new Error('Request schema cannot be empty.');

  return typeof init === 'string' || init instanceof RegExp ? { url: init } : init;
}

type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH';
