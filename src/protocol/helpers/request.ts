/**
 * Request schema helpers: building and serialization.
 */
import { MockRequestSchema, MockRequestSchemaInit } from '../request-schema';
import { serializeRegExps } from './value-matcher';

/**
 * Builds the request schema from init data.
 */
export function buildRequestSchema(init: MockRequestSchemaInit): MockRequestSchema {
  const objInit = toRequestSchemaObjectInit(init);
  // deep-convert any RegExp (bare shorthand or inside `{ $regex }`) to a serializable string
  // for url, query and headers. The body is plain data and is kept as-is.
  const schema = serializeRegExps(objInit) as MockRequestSchema;
  if ('body' in objInit && objInit.body !== undefined) {
    schema.body = objInit.body as MockRequestSchema['body'];
  }
  return schema;
}

/**
 * Converts init data to object, useful for merging additional props.
 */
export function toRequestSchemaObjectInit<T extends Record<string, unknown>>(
  init: string | RegExp | T,
) {
  if (!init) throw new Error('Request schema cannot be empty.');
  return typeof init === 'string' || init instanceof RegExp ? { url: init } : init;
}
