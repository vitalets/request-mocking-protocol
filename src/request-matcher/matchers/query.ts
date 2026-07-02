/**
 * Query matcher.
 */
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';
import { matchValue } from '../value-matcher';

export class QueryMatcher {
  private expectedQuery: MockRequestSchema['query'];
  private noQueryAllowed: boolean;

  constructor(private schema: MockRequestSchema) {
    this.expectedQuery = this.schema.query;
    // null means the request must not contain any query parameters.
    this.noQueryAllowed = this.expectedQuery === null;
  }

  get hasQuery() {
    if (this.noQueryAllowed) return true;
    return Object.keys(this.expectedQuery || {}).length > 0;
  }

  match(ctx: MatchingContext) {
    if (this.noQueryAllowed) return !ctx.searchParams.toString();
    return Object.keys(this.expectedQuery || {}).every((key) => this.matchQueryParam(ctx, key));
  }

  private matchQueryParam(ctx: MatchingContext, name: string) {
    const expectedValue = this.expectedQuery?.[name] ?? null;
    const actualValues = ctx.searchParams.getAll(name);

    // null means the parameter must be absent.
    const result =
      expectedValue === null
        ? actualValues.length === 0
        : actualValues.some((actualValue) => matchValue(expectedValue, actualValue));

    ctx.logger?.log(
      `query param "${name}"`,
      stringifyExpected(expectedValue),
      actualValues.join(','),
    );

    return result;
  }
}

function stringifyExpected(expected: unknown) {
  return expected !== null && typeof expected === 'object' ? JSON.stringify(expected) : expected;
}
