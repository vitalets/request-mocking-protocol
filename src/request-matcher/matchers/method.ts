/**
 * Method matcher.
 */
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';

export class MethodMatcher {
  constructor(private schema: MockRequestSchema) {}

  match(ctx: MatchingContext) {
    const expectedMethod = this.schema.method;
    const actualMethod = ctx.req.method;

    const result = !expectedMethod || expectedMethod === actualMethod;
    ctx.log(result, `method`, expectedMethod || '*', actualMethod);

    return result;
  }
}
