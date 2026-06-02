/**
 * Response builder module — re-exports standalone primitives and the ResponseBuilder class.
 */
import { MockMatchResult } from '../protocol';
import { STATUS_TEXTS } from './status-codes';
import { wait } from './utils';
import { RequestPatcher } from '../request-patcher';
import { buildResponse } from './build-response';
import { patchResponse } from './patch-response';

export { buildResponse, type BuildResponseResult } from './build-response';
export { patchResponse, type PatchResponseResult } from './patch-response';

// Universal shape for response object used by interceptors.
export type ResponseLike = {
  status: number;
  statusText: string;
  headers: Headers;
  arrayBuffer: () => Promise<ArrayBuffer>;
  json: () => Promise<Record<string, unknown>>;
};

export type ResponseBuilderCallbacks = {
  /**
   * Sends the real request and returns the response.
   * Required for "modify" mocks that use bodyPatch or request overrides,
   * where the actual network response must be fetched before patching.
   */
  bypass: (req: Request) => Promise<ResponseLike>;
};

export type ResponseBuilderResult = {
  status: number;
  statusText: string;
  headers: Headers;
  body: string | ArrayBuffer | null;
};

export class ResponseBuilder {
  private status = 200;
  private statusText = 'OK';
  private headers = new Headers();
  private body: string | ArrayBuffer | null = null;

  constructor(
    private matchResult: MockMatchResult,
    private callbacks: ResponseBuilderCallbacks,
  ) {}

  private get resSchema() {
    return this.matchResult.mockSchema.resSchema;
  }

  private get params() {
    return this.matchResult.params;
  }

  private get req() {
    return this.matchResult.req;
  }

  async build(): Promise<ResponseBuilderResult> {
    if (this.needsRealRequest()) {
      const res = await this.sendRealRequest();
      await this.setPatchedResponse(res);
    } else {
      this.setStaticResponse();
    }

    await this.wait();

    return {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      body: this.body,
    };
  }

  private needsRealRequest() {
    return this.resSchema.request || this.resSchema.bodyPatch;
  }

  private async setPatchedResponse(res: ResponseLike) {
    const realBodyStr = this.resSchema.bodyPatch ? JSON.stringify(await res.json()) : '';
    const result = patchResponse(
      this.resSchema,
      {
        status: res.status,
        headers: Object.fromEntries(res.headers),
        body: realBodyStr,
      },
      this.params,
    );

    this.status = result.status;
    this.statusText = STATUS_TEXTS[result.status] ?? res.statusText;
    // Important to use Object.fromEntries(), otherwise headers become empty inside msw.
    // See: https://github.com/mswjs/msw/blob/main/src/core/utils/HttpResponse/decorators.ts#L20
    this.headers = new Headers(result.headers);
    // Remove content-encoding header, otherwise error: Decompression failed
    this.headers.delete('content-encoding');

    if (this.resSchema.bodyPatch) {
      this.setBodyAsString(result.body!, 'application/json');
    } else {
      this.body = await res.arrayBuffer();
    }
  }

  private setStaticResponse() {
    const result = buildResponse(this.resSchema, this.params);
    this.status = result.status;
    this.statusText = result.statusText;
    this.headers = new Headers(result.headers);
    if (result.body !== null) {
      const contentType =
        typeof this.resSchema.body === 'string' ? 'text/plain' : 'application/json';
      this.setBodyAsString(result.body, contentType);
    }
  }

  private async sendRealRequest() {
    const { request: requestOverrides } = this.resSchema;
    const req = requestOverrides
      ? await new RequestPatcher(this.req, requestOverrides, this.params).patch()
      : this.req;

    return this.callbacks.bypass(req);
  }

  private setBodyAsString(body: string, contentType: string) {
    this.body = body;

    if (!this.headers.has('content-type')) {
      this.headers.set('content-type', contentType);
    }

    const contentLength = body ? new Blob([body]).size.toString() : '0';
    this.headers.set('content-length', contentLength);
  }

  private async wait() {
    const { delay } = this.resSchema;
    if (delay) await wait(delay);
  }
}
