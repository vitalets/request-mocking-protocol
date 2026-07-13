/**
 * Response schema helpers: building and validation.
 */
import { MockResponseSchema, MockResponseSchemaInit } from '../response-schema';

/**
 * Builds the response schema from init data.
 */
export function buildResponseSchema(init: MockResponseSchemaInit): MockResponseSchema {
  const obj = toResponseSchemaObjectInit(init);
  assertSchema(obj);

  // Actually init object is already in the correct format, so we just return it.
  return { ...obj };
}

/**
 * Converts init data to object.
 */
export function toResponseSchemaObjectInit(init: MockResponseSchemaInit) {
  return typeof init === 'number' ? { status: init } : init;
}

function assertSchema(schema: MockResponseSchema) {
  const isStaticResponse = schema.status || schema.body;
  const isPatchedResponse = schema.request || schema.bodyPatch;

  if (isStaticResponse && isPatchedResponse) {
    throw new Error('Ambiguous schema: is it static mock or patched response?');
  }
}
