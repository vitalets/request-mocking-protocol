/**
 * Query matcher.
 */
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';

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
    // todo: handle multi-value params in expectedQuery
    const expectedValue = this.expectedQuery?.[name]?.toString() ?? null;
    const actualValues = ctx.searchParams.getAll(name);

    const result =
      expectedValue === null ? actualValues.length === 0 : actualValues.includes(expectedValue);

    ctx.logger?.log(`query param "${name}"`, expectedValue, actualValues.join(','));

    return result;
  }
}
