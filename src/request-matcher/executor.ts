/**
 * Matches particular request.
 */

import { MockRequestSchema } from '../protocol';
import { trimSearchParams } from './utils';

/* eslint-disable no-console */

export class RequestMatcherExecutor {
  private logs: string[] = [];
  private params: Record<string, string> = {};

  #searchParams?: URLSearchParams;

  constructor(
    private schema: MockRequestSchema,
    private urlMatcher: URLPattern | RegExp,
    private req: Request,
    private debug?: boolean,
  ) {}

  // eslint-disable-next-line visual/complexity
  match() {
    this.logs.push(`Matching request: ${this.req.method} ${this.req.url}`);
    try {
      const matched =
        this.matchMethod() &&
        this.matchURL() &&
        this.matchQuery() &&
        this.matchHeaders() &&
        this.matchBody();

      this.logs.push(`Request ${matched ? 'matched' : 'not matched'}.`);

      return matched ? this.params : null;
    } finally {
      if (this.debug) console.log(this.logs.join('\n'));
    }
  }

  private get searchParams() {
    if (!this.#searchParams) {
      this.#searchParams = new URL(this.req.url).searchParams;
    }
    return this.#searchParams;
  }

  private matchMethod() {
    const { req } = this;
    const result = this.schema.method === 'ALL' || req.method === this.schema.method;
    this.log(result, `method`, this.schema.method, req.method);
    return result;
  }

  private matchURL() {
    const { req, schema } = this;
    const shouldTrimSearchParams = Boolean(schema.query);
    const url = shouldTrimSearchParams ? trimSearchParams(req.url) : req.url;

    const result =
      this.urlMatcher instanceof RegExp
        ? this.matchURLRegexp(url, this.urlMatcher)
        : this.matchURLPattern(url, this.urlMatcher);

    this.log(result, `URL`, schema.url, `${url}${shouldTrimSearchParams ? ' (trimmed)' : ''}`);
    return result;
  }

  private matchURLRegexp(url: string, regexp: RegExp) {
    const result = url.match(regexp);
    if (result) this.appendParams(result.groups);
    return Boolean(result);
  }

  private matchURLPattern(url: string, pattern: URLPattern) {
    const result = pattern.exec(url);
    if (!result) return false;

    const keys = Object.keys(result) as Array<keyof typeof result>;
    keys.forEach((key) => {
      const value = result[key];
      if ('groups' in value) this.appendParams(value.groups);
    });

    return true;
  }

  private matchQuery() {
    const expectedQuery = this.schema.query || {};
    const keys = Object.keys(expectedQuery);
    return keys.every((key) => this.matchQueryParam(key, expectedQuery));
  }

  private matchQueryParam(name: string, expectedQuery: Record<string, string | number | null>) {
    // todo: handle multi-value params in expectedQuery
    const expectedValue = expectedQuery[name]?.toString() ?? null;
    const actualValues = this.searchParams.getAll(name);
    const result =
      expectedValue === null ? actualValues.length === 0 : actualValues.includes(expectedValue);
    this.log(result, `query param "${name}"`, expectedValue, actualValues.join(','));
    return result;
  }

  private matchHeaders() {
    const expectedHeaders = this.schema.headers || {};
    const keys = Object.keys(expectedHeaders);
    return keys.every((key) => this.matchHeader(key, expectedHeaders));
  }

  private matchHeader(name: string, expectedHeaders: Record<string, string | null>) {
    const expectedValue = expectedHeaders[name] ?? null;
    const actualValue = this.req.headers.get(name);
    const result = actualValue === expectedValue;
    this.log(result, `header "${name}"`, expectedValue, actualValue);
    return result;
  }

  private matchBody() {
    return true;
  }

  private appendParams(groups: Record<string, string | undefined> = {}) {
    Object.keys(groups).forEach((key) => {
      const isNamedGroup = !/^\d+$/.test(key);
      if (isNamedGroup) this.params[key] = groups[key]!;
    });
  }

  private log(result: boolean, entity: string, expected: unknown, actual: unknown) {
    const icon = result ? '✅' : '❌';
    this.logs.push(`${icon} Expected ${entity}: ${expected}`);
    this.logs.push(`${' '.repeat(4)} Actual ${entity}: ${actual}`);
  }
}
