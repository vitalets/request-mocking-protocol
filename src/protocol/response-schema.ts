/**
 * Schema to generate the response.
 */

// serializable
export type MockResponseSchema = ReplaceResponseSchema | PatchResponseSchema;

export type ReplaceResponseSchema = {
  status: number;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | Array<unknown> | string | null;
  debug?: boolean;
};

export type PatchResponseSchema = {
  bodyPatch: Record<string, string | number | boolean | null>;
  debug?: boolean;
};

export type MockResponseSchemaInit =
  | number
  | {
      status?: ReplaceResponseSchema['status'];
      headers?: ReplaceResponseSchema['headers'];
      body?: ReplaceResponseSchema['body'];
      debug?: ReplaceResponseSchema['debug'];
    }
  | {
      bodyPatch: PatchResponseSchema['bodyPatch'];
      debug?: PatchResponseSchema['debug'];
    };

const defaults: Pick<ReplaceResponseSchema, 'status'> = {
  status: 200,
};

export function buildMockResponseSchema(init: MockResponseSchemaInit): MockResponseSchema {
  const initObj = toMockResponseSchemaObject(init);
  return Object.assign({}, defaults, initObj);
}

export function isPatchResponse(schema: MockResponseSchema): schema is PatchResponseSchema {
  return Boolean('bodyPatch' in schema && schema.bodyPatch);
}

export function toMockResponseSchemaObject(init: MockResponseSchemaInit) {
  return typeof init === 'number' ? { status: init } : init;
}
