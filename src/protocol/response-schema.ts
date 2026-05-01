/**
 * Response schema, transfered over the wire.
 * Must be serializable.
 */
export type MockResponseSchema = {
  /**
   * The HTTP status code, default is 200.
   */
  status?: number;
  /**
   * The response headers, defined as key-value pairs.
   */
  headers?: Record<string, string>;
  /**
   * The response body, defined as a string or JSON.
   */
  body?: string | null | Record<string, unknown> | Array<unknown>;
  /**
   * The response body patch, defined as a key-value pairs.
   * If defined, the real request will be sent, and the response will be patched.
   * Not compatible with the 'body' field.
   */
  bodyPatch?: Record<string, string | number | boolean | null>;
  /**
   * Request overrides.
   * Used for request modification or response patching.
   * If defined, the real request will be sent with the overrides.
   * Not compatible with the 'body' field.
   */
  request?: {
    /**
     * The new URL to send the real request.
     */
    url?: string;
    /**
     * The new request query params, defined as key-value pairs.
     */
    query?: Record<string, string | number | null>;
    /**
     * The new request headers, defined as key-value pairs.
     */
    headers?: Record<string, string | null>;
    /**
     * The new request body, defined as a string or JSON.
     */
    body?: string | null | Record<string, unknown> | Array<unknown>;
    /**
     * The new request body patch, defined as a key-value pairs.
     */
    bodyPatch?: Record<string, string | number | boolean | null>;
  };
  /**
   * The delay in milliseconds before sending the response.
   */
  delay?: number;
  /**
   * Flag to output debug info on server.
   */
  debug?: boolean;
};

export type MockRequestOverrides = NonNullable<MockResponseSchema['request']>;

/**
 * Init data, used to build the response schema.
 * Allows to provide `number` as a shortcut for status.
 */
export type MockResponseSchemaInit = number | MockResponseSchema;

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
