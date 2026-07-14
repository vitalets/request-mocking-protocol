/**
 * Request schema helpers: building and serialization.
 */
import 'urlpattern-polyfill';
import {
  MockRequestSchema,
  MockRequestSchemaInit,
  MockRequestSchemaObjectInit,
  UrlMatcher,
  UrlMatcherInit,
  UrlPatternObj,
} from '../request-schema';
import { serializeRegexp, serializeRegexpInRecord } from './value-matcher';

/**
 * Builds the request schema from init data.
 */
export function buildRequestSchema(init: MockRequestSchemaInit): MockRequestSchema {
  const objInit = toRequestSchemaObjectInit(init);
  const schema = {
    ...objInit,
    url: buildUrlMatcher(objInit.url),
    query: serializeRegexpInRecord(objInit.query),
    headers: serializeRegexpInRecord(objInit.headers),
  } as MockRequestSchema;
  return schema;
}

/**
 * Converts init data to object, useful for merging additional props.
 */
export function toRequestSchemaObjectInit(
  init: MockRequestSchemaInit,
): MockRequestSchemaObjectInit {
  if (!init) throw new Error('Request schema cannot be empty.');
  return isUrlMatcherShortcut(init) ? { url: init } : (init as MockRequestSchemaObjectInit);
}

function serializeUrlPattern(pattern: URLPattern): UrlPatternObj {
  return {
    protocol: pattern.protocol,
    username: pattern.username,
    password: pattern.password,
    hostname: pattern.hostname,
    port: pattern.port,
    pathname: pattern.pathname,
    search: pattern.search,
    hash: pattern.hash,
  };
}

function buildUrlMatcher(url: UrlMatcherInit): UrlMatcher {
  return url instanceof URLPattern ? serializeUrlPattern(url) : serializeRegexp(url);
}

function isUrlMatcherShortcut(
  init: MockRequestSchemaInit,
): init is string | RegExp | UrlPatternObj | URLPattern {
  return (
    typeof init === 'string' ||
    init instanceof RegExp ||
    init instanceof URLPattern ||
    !('url' in init)
  );
}
