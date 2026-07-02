/**
 * Headers matcher.
 */
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';
import { matchValue } from '../value-matcher';

export class HeadersMatcher {
  private expectedHeaders: NonNullable<MockRequestSchema['headers']>;

  constructor(private schema: MockRequestSchema) {
    this.expectedHeaders = this.schema.headers || {};
  }

  match(ctx: MatchingContext) {
    return Object.keys(this.expectedHeaders).every((key) => this.matchHeader(ctx, key));
  }

  private matchHeader(ctx: MatchingContext, name: string) {
    const expectedValue = this.expectedHeaders[name] ?? null;
    const actualValue = ctx.req.headers.get(name);

    // null means the header must be absent.
    const result =
      expectedValue === null ? actualValue === null : matchValue(expectedValue, actualValue);
    ctx.logger?.log(`header "${name}"`, stringifyExpected(expectedValue), actualValue);

    return result;
  }
}

function stringifyExpected(expected: unknown) {
  return expected !== null && typeof expected === 'object' ? JSON.stringify(expected) : expected;
}
