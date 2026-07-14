/**
 * URL matcher.
 */
import 'urlpattern-polyfill';
import {
  ContainsMatcher,
  MockRequestSchema,
  UrlPatternObj,
  regexpFromString,
} from '../../protocol';
import { MatchingContext } from '../context';

export class UrlMatcher {
  private matcher: URLPattern | RegExp | ContainsMatcher;
  public hasQuery = false;

  constructor(private schema: MockRequestSchema) {
    this.matcher = this.buildMatcher();
  }

  match(ctx: MatchingContext) {
    const { req } = ctx;

    // When query matching is configured, URL matching should only check the URL parts.
    // Query params are validated separately by QueryMatcher.
    const shouldTrimSearchParams = this.schema.query !== undefined;
    const url = shouldTrimSearchParams ? trimSearchParams(req.url) : req.url;

    let result: boolean;
    if (this.matcher instanceof RegExp) {
      result = this.matchRegexp(ctx, url, this.matcher);
    } else if (this.matcher instanceof URLPattern) {
      result = this.matchPattern(ctx, url, this.matcher);
    } else {
      result = url.includes(this.matcher.$contains);
    }

    ctx.logger?.log(
      `URL`,
      urlToLogString(this.schema.url),
      `${url}${url !== req.url ? ' (query trimmed)' : ''}`,
    );

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

  private buildMatcher(): URLPattern | RegExp | ContainsMatcher {
    const { url, patternType } = this.schema;

    // Object syntax can be a value matcher or a serializable URLPattern component object.
    if (typeof url === 'object') {
      if ('$regex' in url) return this.buildRegexpMatcher(url.$regex);
      if ('$contains' in url) return this.buildContainsMatcher(url.$contains);
      return this.buildPatternMatcher(url);
    }

    // Legacy string syntax with (deprecated) patternType.
    return patternType === 'regexp' ? this.buildRegexpMatcher(url) : this.buildPatternMatcher(url);
  }

  private buildRegexpMatcher(url: string) {
    this.hasQuery = url.includes('\\?');
    return regexpFromString(url);
  }

  private buildPatternMatcher(url: string | UrlPatternObj) {
    const urlPattern = new URLPattern(url);
    this.hasQuery = urlPattern.search !== '*';
    return urlPattern;
  }

  private buildContainsMatcher(value: string): ContainsMatcher {
    this.hasQuery = value.includes('?');
    return { $contains: value };
  }
}

function urlToLogString(url: MockRequestSchema['url']) {
  return typeof url === 'string' ? url : JSON.stringify(url);
}

function trimSearchParams(url: string) {
  const urlObj = new URL(url);
  urlObj.search = '';
  return urlObj.toString();
}
