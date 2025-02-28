/**
 * Body matcher.
 */
import isMatch from 'lodash/ismatch';
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';

export class BodyMatcher {
  constructor(private schema: MockRequestSchema) {}

  private get expectedBody() {
    return this.schema.body;
  }

  private get expectedBodyStr() {
    return typeof this.expectedBody === 'string'
      ? this.expectedBody
      : JSON.stringify(this.expectedBody);
  }

  async match(ctx: MatchingContext) {
    if (!this.expectedBody) return true;

    const actualBodyStream = this.schema.body;
    if (!actualBodyStream) {
      ctx.log(false, `body`, this.expectedBodyStr, `null`);
      return false;
    }

    if (typeof this.expectedBody === 'string') {
      return this.matchAsString(ctx, this.expectedBody);
    } else {
      return this.matchAsObject(ctx, this.expectedBody);
    }
  }

  private async matchAsString(ctx: MatchingContext, expectedBody: string) {
    const actualBody = await ctx.req.clone().text();
    const result = actualBody === expectedBody;
    ctx.log(result, `body`, expectedBody, trimLongString(actualBody));

    return result;
  }

  private async matchAsObject(
    ctx: MatchingContext,
    expectedBody: Record<string, unknown> | unknown[],
  ) {
    const actualBody = await ctx.req.clone().text();
    const actualBodyParsed = jsonParseSafe(actualBody);

    if (!actualBodyParsed) {
      ctx.log(false, `body`, this.expectedBodyStr, trimLongString(actualBody));
      return false;
    }

    const result = isMatch(actualBodyParsed, expectedBody);
    ctx.log(result, `body`, this.expectedBodyStr, trimLongString(actualBody));

    return result;
  }
}

function trimLongString(str: string, maxLength = 150) {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

function jsonParseSafe(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
