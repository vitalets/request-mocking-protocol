/**
 * Declarative Mocking Protocol.
 *
 * This protocol is used to declaratively define mocks, that can be passed over the wire.
 * Request schema is used to match the request.
 * Response schema is used to generate the response.
 */

import { MockRequestSchema, MockRequestSchemaInit, buildMockRequestSchema } from './request-schema';
import {
  MockResponseSchema,
  MockResponseSchemaInit,
  buildMockResponseSchema,
} from './response-schema';

export * from './request-schema';
export * from './response-schema';

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
    reqSchema: buildMockRequestSchema(reqSchema),
    resSchema: buildMockResponseSchema(resSchema),
  };
}
