/**
 * Base abstract class to mock response
 */
import {
  isPatchResponse,
  PatchResponseSchema,
  ReplaceResponseSchema,
  MockMatchResult,
} from '../protocol';
import { patchObject, wait } from './utils';
import { replacePlaceholders } from './placeholders';

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

  // can be overwritten in child classes
  protected createResponse(body?: string | null, init?: ResponseInit) {
    return new Response(body, init);
  }

  protected async patchResponse({ bodyPatch }: PatchResponseSchema) {
    const realResponse = await this.bypassReq(this.matchResult.req);
    try {
      const body = await realResponse.clone().json();
      patchObject(body, bodyPatch);
      const mockBody = this.buildResponseBody(body);
      const { status } = realResponse;
      await this.delayIfNeeded();
      // don't pass original headers, as they have incorrect content-length
      return this.createResponse(mockBody, { status });
    } catch {
      // todo: log error
      return realResponse;
    }
  }

  protected async replaceResponse({ body, status, headers }: ReplaceResponseSchema) {
    const mockBody = this.buildResponseBody(body);
    await this.delayIfNeeded();
    return this.createResponse(mockBody, { status, headers });
  }

  /**
   * Builds stringified response body with inserted params.
   */
  protected buildResponseBody(body: ReplaceResponseSchema['body'] = null) {
    if (body === null) return null;

    if (typeof body === 'string') {
      return String(replacePlaceholders(body, this.matchResult.params));
    }

    return JSON.stringify(body, (_, value) => {
      return typeof value === 'string'
        ? replacePlaceholders(value, this.matchResult.params)
        : value;
    });
  }

  protected async delayIfNeeded() {
    const { delay } = this.schema;
    if (delay) await wait(delay);
  }
}
