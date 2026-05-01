/**
 * Request schema, transfered over the wire.
 * Must be serializable.
 */
export type MockRequestSchema = {
  /**
   * The pattern to match the request URL.
   */
  url: string;
  /**
   * Pattern type:
   * - 'urlpattern': match request URL by URLPattern (default).
   * - 'regexp': match request URL by regular expression.
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

/**
 * Init data, used to build the request schema.
 */
export type MockRequestSchemaInit = string | RegExp | MockRequestSchemaObjectInit;

/**
 * Init data, passed as object.
 */
export type MockRequestSchemaObjectInit = {
  url: string | RegExp;
  method?: MockRequestSchema['method'];
  query?: MockRequestSchema['query'];
  headers?: MockRequestSchema['headers'];
  body?: MockRequestSchema['body'];
  debug?: MockRequestSchema['debug'];
};

/**
 * Builds the request schema from init data.
 */
export function buildMockRequestSchema(init: MockRequestSchemaInit): MockRequestSchema {
  const { url, ...rest } = toMockRequestSchemaObjectInit(init);
  return {
    // always convert url to string to handle regexp (direct and inside object)
    url: url.toString(),
    patternType: url instanceof RegExp ? 'regexp' : undefined,
    ...rest,
  };
}

/**
 * Converts init data to object, useful for merging additional props.
 */
export function toMockRequestSchemaObjectInit<T extends Record<string, unknown>>(
  init: string | RegExp | T,
) {
  if (!init) throw new Error('Request schema cannot be empty.');
  return typeof init === 'string' || init instanceof RegExp ? { url: init } : init;
}

export type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE';
