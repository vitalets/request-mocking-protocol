/**
 * Response builder class.
 */
import { STATUS_CODES } from 'node:http';
import { MockMatchResult } from '../protocol';
import { patchObject, wait } from './utils';
import {
  cloneWithPlaceholders,
  replacePlaceholders,
  stringifyWithPlaceholders,
} from './placeholders';
import { RequestPatcher } from '../request-patcher';

// Universal shape for response object.
export type ResponseLike = {
  status: number;
  statusText: string;
  headers: Headers;
  arrayBuffer: () => Promise<ArrayBuffer>;
  json: () => Promise<Record<string, unknown>>;
};

export type ResponseBuilderCallbacks = {
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
      await this.setPatchedResponse();
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

  private async setPatchedResponse() {
    const res = await this.sendRealRequest();

    this.setStatus(res.status, res.statusText);
    this.setHeaders(res.headers);

    // remove content-encoding header, otherwise error: Decompression failed
    this.headers.delete('content-encoding');

    await this.setPatchedBody(res);
  }

  private setStaticResponse() {
    if (this.resSchema.status) this.setStatus(this.resSchema.status);
    this.setHeaders();
    this.setStaticBody();
  }

  private setStatus(status: number, statusText?: string) {
    this.status = status;
    this.statusText = statusText || STATUS_CODES[status] || 'Unknown';
  }

  private async sendRealRequest() {
    const { request: requestOverrides } = this.resSchema;
    const req = requestOverrides
      ? await new RequestPatcher(this.req, requestOverrides, this.params).patch()
      : this.req;

    return this.callbacks.bypass(req);
  }

  private setHeaders(origHeaders?: Headers) {
    // Important to use Object.fromEntries(), otherwise headers become empty inside msw.
    // See: https://github.com/mswjs/msw/blob/main/src/core/utils/HttpResponse/decorators.ts#L20
    this.headers = new Headers(Object.fromEntries(origHeaders || []));

    Object.entries(this.resSchema.headers || {}).forEach(([key, value]) => {
      if (value) {
        value = replacePlaceholders(value, this.params);
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
      const bodyPatchFinal = cloneWithPlaceholders(bodyPatch, this.params);
      patchObject(actualBody, bodyPatchFinal);
      this.setBodyAsString(JSON.stringify(actualBody), 'application/json');
    } else {
      this.body = await res.arrayBuffer();
    }
  }

  private setStaticBody() {
    const { body } = this.resSchema;
    if (!body) return;
    if (typeof body === 'string') {
      const newBody = replacePlaceholders(body, this.params);
      this.setBodyAsString(newBody, 'text/plain');
    } else {
      const newBody = stringifyWithPlaceholders(body, this.params);
      this.setBodyAsString(newBody, 'application/json');
    }
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
