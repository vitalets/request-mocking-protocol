/**
 * Module to patch fetch request.
 */

import { MockRequestOverrides } from '../protocol';
import { replacePlaceholders, stringifyWithPlaceholders } from '../response-builder/placeholders';
import { patchObject } from '../response-builder/utils';

export class RequestPatcher {
  private url: URL;
  private headers: Headers;
  private body: RequestInit['body'] = null;

  constructor(
    private req: Request,
    private overrides: MockRequestOverrides,
    private params: Record<string, string> = {},
  ) {
    this.url = new URL(req.url);
    this.headers = new Headers(req.headers);
    this.body = req.body;
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

    const newUrl = String(replacePlaceholders(url, this.params));
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
    const { headers } = this.overrides;
    if (!headers) return;

    Object.keys(headers).forEach((key) => {
      const value = headers[key];
      if (value) {
        this.headers.set(key, String(value));
      } else {
        this.headers.delete(key);
      }
    });
  }

  private async patchBody() {
    const { body, bodyPatch } = this.overrides;

    if (body) {
      this.body =
        typeof body === 'string'
          ? String(replacePlaceholders(body, this.params))
          : stringifyWithPlaceholders(body, this.params);
      this.headers.delete('content-length');
      return;
    }

    if (bodyPatch) {
      const actualBody = await this.req.json();
      const bodyPatchFinal = JSON.parse(stringifyWithPlaceholders(bodyPatch, this.params));
      patchObject(actualBody, bodyPatchFinal);
      this.body = JSON.stringify(actualBody);
      // todo: set correct content length
      this.headers.delete('content-length');
    }
  }

  private buildRequest() {
    return new Request(this.url, {
      method: this.req.method,
      headers: this.headers,
      body: this.body,
    });
  }
}
