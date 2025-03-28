/**
 * RequestMatcher class.
 * The same as URLPattern, but for matching the whole HTTP request.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 * See: https://developer.chrome.com/docs/web-platform/urlpattern
 *
 * todo: move to a separate package.
 */

import { MockRequestSchema } from '../protocol';
import { UrlMatcher } from './matchers/url';
import { BodyMatcher } from './matchers/body';
import { MatchingContext } from './context';
import { MethodMatcher } from './matchers/method';
import { QueryMatcher } from './matchers/query';
import { HeadersMatcher } from './matchers/headers';

export class RequestMatcher {
  private methodMatcher: MethodMatcher;
  private urlMatcher: UrlMatcher;
  private queryMatcher: QueryMatcher;
  private headersMatcher: HeadersMatcher;
  private bodyMatcher: BodyMatcher;

  constructor(
    public schema: MockRequestSchema,
    private debug?: boolean,
  ) {
    this.methodMatcher = new MethodMatcher(this.schema);
    this.urlMatcher = new UrlMatcher(this.schema);
    this.queryMatcher = new QueryMatcher(this.schema);
    this.headersMatcher = new HeadersMatcher(this.schema);
    this.bodyMatcher = new BodyMatcher(this.schema);

    if (schema.debug) this.debug = true;
    this.ensureSingleQuerySource();
  }

  // eslint-disable-next-line visual/complexity
  async match(req: Request) {
    const ctx = new MatchingContext(req);
    try {
      const matched =
        this.methodMatcher.match(ctx) &&
        this.urlMatcher.match(ctx) &&
        this.queryMatcher.match(ctx) &&
        this.headersMatcher.match(ctx) &&
        (await this.bodyMatcher.match(ctx));

      ctx.logDone(matched);

      return matched ? ctx.params : null;
    } finally {
      // eslint-disable-next-line no-console
      if (this.debug) console.log(ctx.logs.join('\n'));
    }
  }

  private ensureSingleQuerySource() {
    if (this.urlMatcher.hasQuery && this.queryMatcher.hasQuery) {
      throw new Error(
        `Query parameters should be defined either in the URL pattern or in the 'query' field.`,
      );
    }
  }
}
