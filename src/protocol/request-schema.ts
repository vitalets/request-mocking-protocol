/**
 * Schema to match the request.
 */

// serializable
export type MockRequestSchema = {
  /**
   * The pattern to match the request URL.
   */
  url: string;
  /**
   * Pattern type:
   * - 'urlpattern': match the URL by pattern (default).
   * - 'regexp': match the URL by regular expression.
   */
  patternType?: 'urlpattern' | 'regexp';
  /**
   * The request method for matching.
   */
  method?: HttpMethod;
  /**
   * The query parameters for matching, defined as key-value pairs.
   */
  query?: Record<string, string | number | null>;
  /**
   * The request headers for matching, defined as key-value pairs.
   */
  headers?: Record<string, string | null>;
  /**
   * The request body for matching, defined as a string or JSON.
   */
  body?: string | Record<string, unknown> | Array<unknown>;
  /**
   * Flag to output debug info on server.
   */
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
