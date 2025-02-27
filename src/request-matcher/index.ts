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
import { regexpFromString } from './utils';
import { RequestMatcherExecutor } from './executor';

export class RequestMatcher {
  private urlMatcher: URLPattern | RegExp;

  constructor(
    public schema: MockRequestSchema,
    private debug?: boolean,
  ) {
    this.urlMatcher = this.buildUrlMatcher();
  }

  match(req: Request) {
    return new RequestMatcherExecutor(this.schema, this.urlMatcher, req, this.debug).match();
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
    return regexpFromString(url);
  }

  private buildUrlPatternMatcher() {
    const { url } = this.schema;
    const urlPattern = new URLPattern(url);
    const hasQuery = urlPattern.search !== '*';
    this.ensureSingleQuerySource(hasQuery);
    return urlPattern;
  }

  private ensureSingleQuerySource(hasQuery: boolean) {
    if (hasQuery && this.schema.query) {
      throw new Error(
        `Query parameters should be defined either in the URL pattern or in the 'query' field.`,
      );
    }
  }
}
