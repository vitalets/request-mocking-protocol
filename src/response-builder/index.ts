/**
 * Response builder class.
 */
import { MockMatchResult } from '../protocol';
import { patchObject, wait } from './utils';
import { replacePlaceholders, stringifyWithPlaceholders } from './placeholders';
import { toHeaders } from '../transport/utils';
import { RequestPatcher } from '../request-patcher';

// Universal shape for response object.
export type ResponseLike = {
  status: number;
  headers: Headers;
  arrayBuffer: () => Promise<ArrayBuffer>;
  json: () => Promise<Record<string, unknown>>;
};

export type ResponseBuilderCallbacks = {
  bypass: (req: Request) => Promise<ResponseLike>;
};

export type ResponseBuilderResult = {
  status: number;
  headers: Headers;
  body: string | ArrayBuffer | null;
};

export class ResponseBuilder {
  private status = 200;
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
      headers: this.headers,
      body: this.body,
    };
  }

  private needsRealRequest() {
    return this.resSchema.request || this.resSchema.bodyPatch;
  }

  private async sendRealRequest() {
    const { request: requestOverrides } = this.resSchema;
    const req = requestOverrides
      ? await new RequestPatcher(this.req, requestOverrides, this.params).patch()
      : this.req;

    return this.callbacks.bypass(req);
  }

  private async setPatchedResponse(res: ResponseLike) {
    this.status = res.status;
    this.headers = new Headers(res.headers);

    const { bodyPatch, headers } = this.resSchema;

    // todo: move to separate method
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        if (value) {
          this.headers.set(key, value);
        } else {
          this.headers.delete(key);
        }
      });
    }

    if (bodyPatch) {
      // todo: match status? If response status is not 200, should we patch it?
      // todo: handle parse error
      const actualBody = await res.json();
      const bodyPatchFinal = JSON.parse(stringifyWithPlaceholders(bodyPatch, this.params));
      patchObject(actualBody, bodyPatchFinal);
      this.body = JSON.stringify(actualBody);
      // todo: set correct content length
      this.headers.delete('content-length');
    } else {
      this.body = await res.arrayBuffer();
    }
  }

  private setStaticResponse() {
    const { status, headers } = this.resSchema;
    if (status) this.status = status;
    if (headers) this.headers = toHeaders(headers);
    this.setStaticResponseBody();
  }

  private setStaticResponseBody() {
    const { body } = this.resSchema;
    if (!body) return;

    if (typeof body === 'string') {
      this.body = String(replacePlaceholders(body, this.params));
      return;
    }

    if (!this.headers.has('content-type')) {
      this.headers.set('content-type', 'application/json');
    }

    this.body = stringifyWithPlaceholders(body, this.params);
  }

  private async wait() {
    const { delay } = this.resSchema;
    if (delay) await wait(delay);
  }
}
