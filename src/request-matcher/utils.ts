import { RequestMatcher } from '.';
import { MockMatchResult, MockSchema } from '../protocol';

export async function matchSchemas(
  req: Request,
  mockSchemas: MockSchema[] = [],
): Promise<MockMatchResult | undefined> {
  for (const mockSchema of mockSchemas) {
    const debug = mockSchema.reqSchema.debug || mockSchema.resSchema.debug;
    const matcher = new RequestMatcher(mockSchema.reqSchema, debug);
    const result = await matcher.match(req);
    if (result) {
      return { mockSchema, req: req, params: result };
    }
  }
}
