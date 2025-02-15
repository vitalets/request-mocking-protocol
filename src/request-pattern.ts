/**
 * RequestPattern class.
 * The same as URLPattern, but for matching a whole HTTP request.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 *
 * todo: move to a separate package.
 */

import picomatch from 'picomatch';

export type PatternType = 'minimatch' | 'urlpattern';

export type RequestPatternInit =
  | string
  | {
      url: string;
      method?: string;
      patternType?: PatternType;
      searchParams?: Record<string, string>;
      headers?: Record<string, string>;
      body?: string;
      // todo: bodyPartial or use approach like in PW objectContaining({  })
    };

type RequestPatternOptions = {
  method: string;
  url: string;
  patternType?: PatternType;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
};

const defaults: Pick<RequestPatternOptions, 'method' | 'patternType'> = {
  patternType: 'minimatch',
  method: 'GET',
};

export class RequestPattern {
  private options: RequestPatternOptions;
  // private urlPattern?: URLPattern;
  private urlMatcher: (url: string) => boolean;

  constructor(init: RequestPatternInit) {
    this.options = this.resolveOptions(init);
    // todo: normalize url: add trailing slash, etc
    // new URL(url).toString() does not work, as it replaces * with %2A
    this.urlMatcher = picomatch(this.options.url);
  }

  // eslint-disable-next-line visual/complexity
  test(req: Request) {
    if (!this.matchMethod(req)) return false;
    if (!this.matchURL(req)) return false;
    if (!this.matchSearchParams(req)) return false;
    if (!this.matchHeaders(req)) return false;
    if (!this.matchBody(req)) return false;
    return true;
  }

  private resolveOptions(init: RequestPatternInit) {
    const initObj = typeof init === 'string' ? { url: init } : init;
    return Object.assign({}, defaults, initObj);
  }

  private matchMethod(req: Request) {
    // todo: store mathcing info for debug
    return req.method === this.options.method;
  }

  private matchURL(req: Request) {
    return this.urlMatcher(req.url);
  }

  private matchSearchParams(_req: Request) {
    return true;
  }

  private matchHeaders(_req: Request) {
    return true;
  }

  private matchBody(_req: Request) {
    return true;
  }
}
