/**
 * Headers matcher.
 */
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';

export class HeadersMatcher {
  private expectedHeaders: Record<string, string | null>;

  constructor(private schema: MockRequestSchema) {
    this.expectedHeaders = this.schema.headers || {};
  }

  match(ctx: MatchingContext) {
    return Object.keys(this.expectedHeaders).every((key) => this.matchHeader(ctx, key));
  }

  private matchHeader(ctx: MatchingContext, name: string) {
    const expectedValue = this.expectedHeaders[name] ?? null;
    const actualValue = ctx.req.headers.get(name);

    const result = actualValue === expectedValue;
    ctx.log(result, `header "${name}"`, expectedValue, actualValue);

    return result;
  }
}
