/**
 * URL matcher.
 */
import 'urlpattern-polyfill';
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';

export class UrlMatcher {
  private matcher: URLPattern | RegExp;
  public hasQuery = false;

  constructor(private schema: MockRequestSchema) {
    this.matcher =
      this.schema.patternType === 'regexp' ? this.buildRegexpMatcher() : this.buildPatternMatcher();
  }

  match(ctx: MatchingContext) {
    const { req } = ctx;

    const shouldTrimSearchParams = Boolean(this.schema.query);
    const url = shouldTrimSearchParams ? trimSearchParams(req.url) : req.url;

    const result =
      this.matcher instanceof RegExp
        ? this.matchRegexp(ctx, url, this.matcher)
        : this.matchPattern(ctx, url, this.matcher);

    ctx.log(result, `URL`, this.schema.url, `${url}${url !== req.url ? ' (query trimmed)' : ''}`);

    return result;
  }

  private matchRegexp(ctx: MatchingContext, url: string, regexp: RegExp) {
    const result = url.match(regexp);
    if (result) ctx.appendParams(result.groups);
    return Boolean(result);
  }

  private matchPattern(ctx: MatchingContext, url: string, pattern: URLPattern) {
    const result = pattern.exec(url);
    if (!result) return false;

    const keys = Object.keys(result) as Array<keyof typeof result>;
    keys.forEach((key) => {
      const value = result[key];
      if ('groups' in value) ctx.appendParams(value.groups);
    });

    return true;
  }

  private buildRegexpMatcher() {
    const { url } = this.schema;
    this.hasQuery = url.includes('\\?');
    return regexpFromString(url);
  }

  private buildPatternMatcher() {
    const { url } = this.schema;
    const urlPattern = new URLPattern(url);
    this.hasQuery = urlPattern.search !== '*';
    return urlPattern;
  }
}

function regexpFromString(s: string) {
  const source = s.slice(1, s.lastIndexOf('/'));
  const flags = s.slice(s.lastIndexOf('/') + 1);
  return new RegExp(source, flags);
}

function trimSearchParams(url: string) {
  const urlObj = new URL(url);
  urlObj.search = '';
  return urlObj.toString();
}
