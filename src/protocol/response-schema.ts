/**
 * Schema to generate the response.
 */

// serializable
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
export type MockResponseSchemaInit = number | MockResponseSchema;

export function buildMockResponseSchema(init: MockResponseSchemaInit): MockResponseSchema {
  const initObj = toMockResponseSchemaObject(init);
  assertSchema(initObj);

  return Object.assign({}, initObj);
}

export function toMockResponseSchemaObject(init: MockResponseSchemaInit) {
  return typeof init === 'number' ? { status: init } : init;
}

function assertSchema(schema: MockResponseSchema) {
  const isStaticResponse = schema.status || schema.body;
  const isPatchedResponse = schema.request || schema.bodyPatch;

  if (isStaticResponse && isPatchedResponse) {
    throw new Error('Ambiguous schema: is it static mock or patched response?');
  }
}
