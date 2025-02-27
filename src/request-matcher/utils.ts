import { RequestMatcher } from '.';
import { MockSchema } from '../protocol';

/**
 * Creates RegExp instance from string.
 * See: https://github.com/flightcontrolhq/superjson/blob/main/src/transformer.ts#L119
 */
export function regexpFromString(s: string) {
  const source = s.slice(1, s.lastIndexOf('/'));
  const flags = s.slice(s.lastIndexOf('/') + 1);
  return new RegExp(source, flags);
}

/**
 * Removes search parameters from a given URL string.
 * https://example.com?param1=value1 -> https://example.com/
 */
export function trimSearchParams(url: string) {
  const urlObj = new URL(url);
  urlObj.search = '';
  return urlObj.toString();
}

export function findMatchedSchema(req: Request, mockSchemas?: MockSchema[]) {
  return mockSchemas?.find(({ reqSchema }) => new RequestMatcher(reqSchema).test(req));
}
