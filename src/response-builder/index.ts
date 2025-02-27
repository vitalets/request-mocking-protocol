/**
 * Base abstract class to mock response
 */
import {
  isPatchResponse,
  PatchResponseSchema,
  ReplaceResponseSchema,
  MockMatchResult,
} from '../protocol';
import { patchObject } from './utils';

export abstract class BaseResponseBuilder {
  constructor(protected matchResult: MockMatchResult) {}

  protected abstract bypassReq(req: Request): Promise<Response>;

  protected get schema() {
    return this.matchResult.mockSchema.resSchema;
  }

  async build() {
    return isPatchResponse(this.schema)
      ? this.patchResponse(this.schema)
      : this.replaceResponse(this.schema);
  }

  protected async patchResponse({ bodyPatch }: PatchResponseSchema) {
    const realResponse = await this.bypassReq(this.matchResult.req);
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
    // substitute params
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
