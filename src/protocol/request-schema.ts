/**
 * Request schema for the mocking protocol.
 * Must be serializable, to be transferred over the wire.
 */
import { JsonValue, ValueMatcher, ValueMatcherInit } from './value-matcher';

export type MockRequestSchema = {
  /**
   * The pattern to match the request URL.
   * A URLPattern string/component object, or a matcher object: `{ $regex }`, `{ $contains }`.
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
   * Matched as plain data (exact for strings, subset for JSON); value matchers are not applied.
   */
  body?: string | { [key: string]: JsonValue } | JsonValue[];
  /**
   * Flag to output debug info on server.
   */
  debug?: boolean;
};

/**
 * Init data, used to build the request schema.
 * Allows to provide `string` | `RegExp` as a shortcut for url.
 */
export type MockRequestSchemaInit =
  string | RegExp | UrlPatternObj | URLPattern | MockRequestSchemaObjectInit;

/**
 * Init data, passed as object.
 * Accepts a bare `RegExp` as a shorthand for `{ $regex }`
 * (converted to a serializable string when building the schema).
 */
export type MockRequestSchemaObjectInit = {
  url: UrlMatcherInit;
  /** @deprecated use the `url` object syntax instead, e.g. `{ $regex: '...' }` or `{ $contains: '...' }`. */
  patternType?: MockRequestSchema['patternType'];
  method?: MockRequestSchema['method'];
  query?: Record<string, ValueMatcherInit | null> | null;
  headers?: Record<string, ValueMatcherInit | null>;
  body?: string | { [key: string]: JsonValue } | JsonValue[];
  debug?: MockRequestSchema['debug'];
};

export type HttpMethod =
  'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE';

/**
 * URL matcher stored in the serializable protocol schema.
 * - `string`: match request URL by URLPattern (default).
 * - `{ $regex }`: match request URL by regular expression.
 * - `{ $contains }`: match request URL by substring.
 * - `UrlPatternObj`: match selected URL components such as hostname, pathname, or port.
 */
export type UrlMatcher = Exclude<ValueMatcher, number> | UrlPatternObj;

/**
 * URL matcher accepted as input. URLPattern instances are converted to a serializable
 * component object when the request schema is built.
 */
export type UrlMatcherInit = Exclude<ValueMatcherInit, number> | UrlPatternObj | URLPattern;

/**
 * Serializable URLPattern components supported by the protocol.
 * Component fields mirror URLPatternInit, excluding the construction-only `baseURL`.
 * Omitted components match any value.
 */
export type UrlPatternObj = {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
};
