/**
 * Body matcher.
 */
import isMatch from 'lodash/ismatch';
import { MockRequestSchema } from '../../protocol';
import { MatchingContext } from '../context';

export class BodyMatcher {
  constructor(private schema: MockRequestSchema) {}

  match(ctx: MatchingContext) {
    const expectedBody = this.schema.body;

    if (!expectedBody) return true;

    if (typeof expectedBody === 'string') {
      return this.matchAsString(ctx, expectedBody);
    } else {
      return this.matchAsObject(ctx, expectedBody);
    }
  }

  private matchAsString(ctx: MatchingContext, expectedBody: string) {
    const actualBody = ctx.req.body;

    if (typeof actualBody !== 'string') {
      ctx.log(false, `body`, expectedBody, `(${typeof actualBody})`);
      return false;
    }

    const result = actualBody === expectedBody;
    ctx.log(result, `body`, expectedBody, trimLongString(actualBody));

    return result;
  }

  private matchAsObject(ctx: MatchingContext, expectedBody: Record<string, unknown> | unknown[]) {
    const actualBody = ctx.req.body;
    const expectedBodyStr = JSON.stringify(expectedBody);

    if (typeof actualBody !== 'string') {
      ctx.log(false, `body`, expectedBodyStr, `(${typeof actualBody})`);
      return false;
    }

    const actualBodyParsed = jsonParseSafe(actualBody);
    if (!actualBodyParsed) {
      ctx.log(false, `body`, expectedBodyStr, trimLongString(actualBody));
      return false;
    }

    const result = isMatch(actualBodyParsed, expectedBody);
    ctx.log(result, `body`, expectedBodyStr, trimLongString(actualBody));

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
