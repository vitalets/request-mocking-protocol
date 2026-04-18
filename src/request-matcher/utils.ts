import { RequestMatcher } from '.';
import { MockMatchResult, MockSchema } from '../protocol';
import { MatchingLogger } from './logger';

export async function matchSchemas(
  req: Request,
  mockSchemas: MockSchema[] = [],
): Promise<MockMatchResult | undefined> {
  const logger = initLogger(req, mockSchemas);
  try {
    return await matchSchemasInternal(req, mockSchemas, logger);
  } finally {
    logger.finalize();
  }
}

async function matchSchemasInternal(
  req: Request,
  mockSchemas: MockSchema[] = [],
  logger?: MatchingLogger,
) {
  let matchResult: MockMatchResult | undefined;

  for (const mockSchema of mockSchemas) {
    const matcher = new RequestMatcher(mockSchema.reqSchema, logger);
    const result = await matcher.match(req);
    if (result) {
      matchResult = { mockSchema, req: req, params: result };
      break;
    }
  }

  return matchResult;
}

function initLogger(req: Request, mockSchemas: MockSchema[]) {
  const logger = new MatchingLogger(req, hasDebug(mockSchemas));
  logger.init(mockSchemas.length);
  return logger;
}

function hasDebug(schemas: MockSchema[]) {
  return schemas.some((schema) => schema.reqSchema.debug || schema.resSchema.debug);
}
