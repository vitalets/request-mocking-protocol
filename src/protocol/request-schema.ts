/**
 * Request schema for the mocking protocol.
 * Must be serializable, to be transferred over the wire.
 */
export type MockRequestSchema = {
  /**
   * The pattern to match the request URL.
   * Either a plain string (URLPattern), or a matcher object: `{ $regex }`, `{ $contains }`.
   */
  url: UrlMatcher;
  /**
   * Pattern type:
   * - 'urlpattern': match request URL by URLPattern (default).
   * - 'regexp': match request URL by regular expression.
   * @deprecated use the `url` object syntax instead, e.g. `{ $regex: '...' }` or `{ $contains: '...' }`.
   */
  patternType?: 'urlpattern' | 'regexp';
  /**
   * The request method for matching.
   */
  method?: HttpMethod;
  /**
   * The query parameters for matching, defined as key-value pairs.
   * Each value can be an exact string/number or a matcher object ({ $contains } / { $regex }).
   * Set a value to null to match requests without that parameter.
   * Set the whole field to null to match requests without any query parameters.
   */
  query?: Record<string, ValueMatcher | null> | null;
  /**
   * The request headers for matching, defined as key-value pairs.
   * Each value can be an exact string or a matcher object ({ $contains } / { $regex }).
   * Set a value to null to match requests without that header.
   */
  headers?: Record<string, ValueMatcher | null>;
  /**
   * The request body for matching, defined as a string or JSON.
   * Any JSON leaf can be a matcher object ({ $contains } / { $regex }).
   */
  body?: string | { [key: string]: JsonMatcherValue } | JsonMatcherValue[];
  /**
   * Flag to output debug info on server.
   */
  debug?: boolean;
};

/**
 * Init data, used to build the request schema.
 * Allows to provide `string` | `RegExp` as a shortcut for url.
 */
export type MockRequestSchemaInit = string | RegExp | MockRequestSchemaObjectInit;

/**
 * Init data, passed as object.
 */
export type MockRequestSchemaObjectInit = {
  url: string | RegExp | UrlMatcher;
  /** @deprecated use the `url` object syntax instead, e.g. `{ $regex: '...' }` or `{ $contains: '...' }`. */
  patternType?: MockRequestSchema['patternType'];
  method?: MockRequestSchema['method'];
  query?: MockRequestSchema['query'];
  headers?: MockRequestSchema['headers'];
  body?: MockRequestSchema['body'];
  debug?: MockRequestSchema['debug'];
};

/**
 * Builds the request schema from init data.
 */
export function buildRequestSchema(init: MockRequestSchemaInit): MockRequestSchema {
  const { url, ...rest } = toRequestSchemaObjectInit(init);
  return {
    // convert RegExp shorthand to the modern { $regex } matcher object.
    // plain strings and matcher objects ({ $regex } / { $contains }) are kept as-is.
    url: url instanceof RegExp ? { $regex: url.toString() } : url,
    ...rest,
  };
}

/**
 * Converts init data to object, useful for merging additional props.
 */
export function toRequestSchemaObjectInit<T extends Record<string, unknown>>(
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

/**
 * Generic value matcher, used by query, headers and body fields.
 * - `string` | `number`: match by exact equality (default).
 * - `{ $contains }`: match strings that include the given substring.
 * - `{ $regex }`: match strings against the given regular expression.
 */
export type ValueMatcher = string | number | { $contains: string } | { $regex: string };

/**
 * URL matcher: a `ValueMatcher` without `number` (a plain string is matched via URLPattern).
 * - `string`: match request URL by URLPattern (default).
 * - `{ $regex }`: match request URL by regular expression.
 * - `{ $contains }`: match request URL by substring.
 */
export type UrlMatcher = Exclude<ValueMatcher, number>;

/**
 * Recursive JSON value that may contain a `ValueMatcher` ({ $contains } / { $regex }) at any leaf.
 */
export type JsonMatcherValue =
  | ValueMatcher
  | boolean
  | null
  | { [key: string]: JsonMatcherValue }
  | JsonMatcherValue[];
