/**
 * Query matcher.
 */
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';

export class QueryMatcher {
  private expectedQuery: Record<string, string | number | null>;

  constructor(private schema: MockRequestSchema) {
    this.expectedQuery = this.schema.query || {};
  }

  get hasQuery() {
    return Object.keys(this.expectedQuery).length > 0;
  }

  match(ctx: MatchingContext) {
    return Object.keys(this.expectedQuery).every((key) => this.matchQueryParam(ctx, key));
  }

  private matchQueryParam(ctx: MatchingContext, name: string) {
    // todo: handle multi-value params in expectedQuery
    const expectedValue = this.expectedQuery[name]?.toString() ?? null;
    const actualValues = ctx.searchParams.getAll(name);

    const result =
      expectedValue === null ? actualValues.length === 0 : actualValues.includes(expectedValue);

    ctx.log(result, `query param "${name}"`, expectedValue, actualValues.join(','));

    return result;
  }
}
