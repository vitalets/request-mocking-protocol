/**
 * Module to patch fetch request.
 */

import { MockRequestOverrides } from '../protocol';
import {
  cloneWithPlaceholders,
  replacePlaceholders,
  stringifyWithPlaceholders,
} from '../response-builder/placeholders';
import { patchObject } from '../response-builder/utils';

export class RequestPatcher {
  private url: URL;
  private headers: Headers;
  private body?: RequestInit['body'];

  constructor(
    private req: Request,
    private overrides: MockRequestOverrides,
    private params: Record<string, string> = {},
  ) {
    this.url = new URL(req.url);
    this.headers = new Headers(req.headers);
  }

  async patch() {
    this.patchUrl();
    this.patchQuery();
    this.patchHeaders();
    await this.patchBody();

    return this.buildRequest();
  }

  private patchUrl() {
    const { url } = this.overrides;
    if (!url) return;

    const newUrl = replacePlaceholders(url, this.params);
    this.url = new URL(newUrl);
  }

  private patchQuery() {
    const { query } = this.overrides;
    if (!query) return;

    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (value) {
        this.url.searchParams.set(key, String(value));
      } else {
        this.url.searchParams.delete(key);
      }
    });
  }

  private patchHeaders() {
    this.headers.set('content-encoding', 'identity');
    Object.entries(this.overrides.headers || {}).forEach(([key, value]) => {
      if (value) {
        this.headers.set(key, String(value));
      } else {
        this.headers.delete(key);
      }
    });
  }

  // eslint-disable-next-line max-statements
  private async patchBody() {
    const { body, bodyPatch } = this.overrides;

    if (body === null) {
      this.body = null;
      return;
    }

    if (body) {
      if (typeof body === 'string') {
        const newBody = replacePlaceholders(body, this.params);
        this.setBodyAsString(newBody, 'text/plain');
      } else {
        const newBody = stringifyWithPlaceholders(body, this.params);
        this.setBodyAsString(newBody, 'application/json');
      }
    } else if (bodyPatch) {
      const actualBody = await this.req.json();
      const bodyPatchFinal = cloneWithPlaceholders(bodyPatch, this.params);
      patchObject(actualBody, bodyPatchFinal);
      this.setBodyAsString(JSON.stringify(actualBody), 'application/json');
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

  private buildRequest() {
    const { req } = this;
    return new Request(this.url, {
      headers: this.headers,
      body: this.body,
      method: req.method,
      mode: req.mode,
      credentials: req.credentials,
      cache: req.cache,
      redirect: req.redirect,
      referrer: req.referrer,
      integrity: req.integrity,
      keepalive: req.keepalive,
      signal: req.signal,
    });
  }
}
