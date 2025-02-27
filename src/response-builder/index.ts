/**
 * Base abstract class to mock response
 */
import {
  isPatchResponse,
  MockResponseSchema,
  MockResponseSchemaInit,
  PatchResponseSchema,
  ReplaceResponseSchema,
  buildMockResponseSchema,
} from '../protocol';
import { patchObject } from './utils';

export abstract class BaseResponseBuilder {
  protected schema: MockResponseSchema;

  constructor(
    protected req: Request,
    schema: MockResponseSchemaInit,
  ) {
    this.schema = buildMockResponseSchema(schema);
  }

  protected abstract bypassReq(req: Request): Promise<Response>;

  async build() {
    return isPatchResponse(this.schema)
      ? this.patchResponse(this.schema)
      : this.replaceResponse(this.schema);
  }

  protected async patchResponse({ bodyPatch }: PatchResponseSchema) {
    const realResponse = await this.bypassReq(this.req);
    try {
      const body = await realResponse.clone().json();
      patchObject(body, bodyPatch);
      const bodyStr = stringifyBody(body);
      const { status } = realResponse;
      // don't pass original headers, as they have incorrect content-length
      return this.createResponse(bodyStr, { status });
    } catch {
      // todo: log error
      return realResponse;
    }
  }

  protected replaceResponse({ body, status, headers }: ReplaceResponseSchema) {
    const bodyStr = stringifyBody(body);
    return this.createResponse(bodyStr, { status, headers });
  }

  protected createResponse(body?: string | null, init?: ResponseInit) {
    return new Response(body, init);
  }
}

function stringifyBody(body: ReplaceResponseSchema['body']) {
  return body && typeof body === 'object' ? JSON.stringify(body) : body;
}
