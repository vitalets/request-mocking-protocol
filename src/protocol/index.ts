/**
 * Declarative Mocking Protocol.
 *
 * This protocol is used to declaratively define mocks, that can be passed over the wire.
 * Request schema is used to match the request.
 * Response schema is used to generate the response.
 */

import { MockRequestSchema, MockRequestSchemaInit } from './request-schema';
import { MockResponseSchema, MockResponseSchemaInit } from './response-schema';
import { buildRequestSchema } from './helpers/request';
import { buildResponseSchema } from './helpers/response';

export * from './request-schema';
export * from './response-schema';
export * from './value-matcher';
export * from './helpers/request';
export * from './helpers/response';
export * from './helpers/value-matcher';

export type MockSchema = {
  reqSchema: MockRequestSchema;
  resSchema: MockResponseSchema;
};

/**
 * Builds a full mock schema (request + response) from init data.
 */
export function buildMockSchema(
  reqSchema: MockRequestSchemaInit,
  resSchema: MockResponseSchemaInit,
): MockSchema {
  return {
    reqSchema: buildRequestSchema(reqSchema),
    resSchema: buildResponseSchema(resSchema),
  };
}

export type MockMatchResult = {
  mockSchema: MockSchema;
  req: Request;
  params: Record<string, string>;
};
