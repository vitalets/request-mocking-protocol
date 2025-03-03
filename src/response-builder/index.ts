/**
 * Response builder class.
 */
import { MockMatchResult } from '../protocol';
import { patchObject, wait } from './utils';
import { replacePlaceholders, stringifyWithPlaceholders } from './placeholders';
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
      await this.setPatchedResponse();
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

  private async setPatchedResponse() {
    const res = await this.sendRealRequest();
    this.status = res.status;
    this.setHeaders(res.headers);
    await this.setPatchedBody(res);
  }

  private setStaticResponse() {
    if (this.resSchema.status) this.status = this.resSchema.status;
    this.setHeaders();
    this.setStaticBody();
  }

  private async sendRealRequest() {
    const { request: requestOverrides } = this.resSchema;
    const req = requestOverrides
      ? await new RequestPatcher(this.req, requestOverrides, this.params).patch()
      : this.req;

    return this.callbacks.bypass(req);
  }

  private setHeaders(origHeaders?: Headers) {
    this.headers = new Headers(origHeaders);
    const { headers } = this.resSchema;
    if (!headers) return;

    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        value = String(replacePlaceholders(value, this.params));
        this.headers.set(key, value);
      } else {
        this.headers.delete(key);
      }
    });
  }

  private async setPatchedBody(res: ResponseLike) {
    const { bodyPatch } = this.resSchema;
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

  private setStaticBody() {
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
