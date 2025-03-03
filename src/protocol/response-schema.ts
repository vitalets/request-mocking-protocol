/**
 * Schema to generate the response.
 */

// serializable
export type MockResponseSchema = {
  status?: number; // default is 200
  headers?: Record<string, string>;
  body?: Record<string, unknown> | Array<unknown> | string | null;
  bodyPatch?: Record<string, string | number | boolean | null>;
  request?: {
    url?: string;
    query?: Record<string, string | number | null>;
    headers?: Record<string, string | null>;
    body?: Record<string, unknown> | Array<unknown> | string | null;
    bodyPatch?: Record<string, string | number | boolean | null>;
  };
  delay?: number;
  debug?: boolean;
};

export type MockRequestOverrides = NonNullable<MockResponseSchema['request']>;
export type MockResponseSchemaInit = number | MockResponseSchema;

export function buildMockResponseSchema(init: MockResponseSchemaInit): MockResponseSchema {
  const initObj = toMockResponseSchemaObject(init);

  // check both body and bodyPatch: throw error

  return Object.assign({}, initObj);
}

export function toMockResponseSchemaObject(init: MockResponseSchemaInit) {
  return typeof init === 'number' ? { status: init } : init;
}
