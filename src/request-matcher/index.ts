/**
 * RequestMatcher class.
 * The same as URLPattern, but for matching the whole HTTP request.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 * See: https://developer.chrome.com/docs/web-platform/urlpattern
 *
 * todo: store matching info for debug
 * todo: move to a separate package.
 */

import 'urlpattern-polyfill';
import { MockRequestSchema } from '../protocol';
import { regexpFromString, trimSearchParams } from './utils';
import { RequestMatcherLogger } from './logger';

type MatchingContext = {
  req: Request;
  logger: RequestMatcherLogger;
};

export class RequestMatcher {
  private urlMatcher: (url: string) => boolean;

  constructor(public schema: MockRequestSchema) {
    this.urlMatcher = this.buildUrlMatcher();
  }

  test(req: Request) {
    const ctx = { req, logger: new RequestMatcherLogger() };
    return (
      this.matchMethod(ctx) &&
      this.matchURL(ctx) &&
      this.matchQuery(req) &&
      this.matchHeaders(req) &&
      this.matchBody(req)
    );
  }

  private matchMethod({ req, logger }: MatchingContext) {
    const result = this.schema.method === 'ALL' || req.method === this.schema.method;
    logger.matchMethod(result, this.schema.method, req.method);
    return result;
  }

  private matchURL({ req, logger }: MatchingContext) {
    const url = this.schema.query ? trimSearchParams(req.url) : req.url;
    const result = this.urlMatcher(url);
    logger.matchURL(result, this.schema.method, req.method);
    return result;
  }

  private matchQuery(req: Request) {
    const expectedQuery = this.schema.query;
    if (!expectedQuery) return true;
    const keys = Object.keys(expectedQuery);
    const { searchParams } = new URL(req.url);
    return keys.every((key) => {
      const expectedValue = expectedQuery[key];
      // null - param should not exist in the request
      if (isNullOrUndefined(expectedValue)) return !searchParams.has(key);
      // todo: handle multi-value params
      return searchParams.get(key) === String(expectedQuery[key]);
    });
  }

  private matchHeaders(_req: Request) {
    return true;
  }

  private matchBody(_req: Request) {
    return true;
  }

  private buildUrlMatcher() {
    return this.schema.patternType === 'regexp'
      ? this.buildUrlRegexpMatcher()
      : this.buildUrlPatternMatcher();
  }

  private buildUrlRegexpMatcher() {
    const { url } = this.schema;
    const hasQuery = url.includes('\\?');
    this.ensureSingleQuerySource(hasQuery);
    const regexp = regexpFromString(url);
    return (url: string) => regexp.test(url);
  }

  private buildUrlPatternMatcher() {
    const { url } = this.schema;
    const urlPattern = new URLPattern(url);
    const hasQuery = urlPattern.search !== '*';
    this.ensureSingleQuerySource(hasQuery);
    return (url: string) => urlPattern.test(url);
  }

  private ensureSingleQuerySource(hasQuery: boolean) {
    if (hasQuery && this.schema.query) {
      throw new Error(
        `Query parameters should be defined either in the URL pattern or in the 'query' field.`,
      );
    }
  }
}

function isNullOrUndefined(value: unknown) {
  return value === null || value === undefined;
}
