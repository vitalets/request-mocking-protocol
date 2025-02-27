import { RequestMatcher } from '.';
import { MockMatchResult, MockSchema } from '../protocol';

export function matchSchemas(
  req: Request,
  mockSchemas: MockSchema[] = [],
): MockMatchResult | undefined {
  for (const mockSchema of mockSchemas) {
    const debug = mockSchema.reqSchema.debug || mockSchema.resSchema.debug;
    const matcher = new RequestMatcher(mockSchema.reqSchema, debug);
    const result = matcher.match(req);
    if (result) {
      return { mockSchema, req: req, params: result };
    }
  }
}
