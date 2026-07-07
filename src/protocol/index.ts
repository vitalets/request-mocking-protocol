/**
 * Declarative Mocking Protocol.
 *
 * This protocol is used to declaratively define mocks, that can be passed over the wire.
 * Request schema is used to match the request.
 * Response schema is used to generate the response.
 */

import { MockRequestSchema, MockRequestSchemaInit, buildRequestSchema } from './request-schema';
import { MockResponseSchema, MockResponseSchemaInit, buildResponseSchema } from './response-schema';

export * from './request-schema';
export * from './response-schema';
export * from './value-matcher';

export type MockSchema = {
  reqSchema: MockRequestSchema;
  resSchema: MockResponseSchema;
};

export type MockMatchResult = {
  mockSchema: MockSchema;
  req: Request;
  params: Record<string, string>;
};

export function buildMockSchema(
  reqSchema: MockRequestSchemaInit,
  resSchema: MockResponseSchemaInit,
): MockSchema {
  return {
    reqSchema: buildRequestSchema(reqSchema),
    resSchema: buildResponseSchema(resSchema),
  };
}
