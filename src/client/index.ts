/**
 * MockClient class.
 */
import {
  MockRequestSchema,
  MockRequestSchemaInit,
  MockRequestSchemaObjectInit,
  MockResponseSchemaInit,
  MockSchema,
  UrlPatternObj,
  buildRequestSchema,
  buildResponseSchema,
  toRequestSchemaObjectInit,
} from '../protocol';
import { buildMockHeaders } from '../transport';
import { getEnvDebug } from './env';
import { mergeOptions } from './utils';

export type MockClientOptions = {
  debug?: boolean;
};

export type MockRequestSchemaInitNoMethod =
  string | RegExp | UrlPatternObj | URLPattern | Omit<MockRequestSchemaObjectInit, 'method'>;

export class MockClient {
  private mockSchemas: MockSchema[] = [];
  private _headers: Record<string, string> = {};
  public onChange?: (headers: Record<string, string>) => unknown;

  constructor(protected options?: MockClientOptions) {
    const debug = options?.debug ?? getEnvDebug();
    this.options = mergeOptions({ debug }, options);
  }

  get headers(): Readonly<Record<string, string>> {
    return this._headers;
  }

  get schemas() {
    return [...this.mockSchemas];
  }

  async addMock(reqSchema: MockRequestSchemaInit, resSchema: MockResponseSchemaInit) {
    const mockSchema = {
      reqSchema: this.buildRequestSchema(reqSchema),
      resSchema: this.buildResponseSchema(resSchema),
    };
    this.mockSchemas.unshift(mockSchema);
    await this.rebuildHeaders();
  }

  async GET(reqSchema: MockRequestSchemaInitNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('GET', reqSchema, resSchema);
  }

  async POST(reqSchema: MockRequestSchemaInitNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('POST', reqSchema, resSchema);
  }

  async PUT(reqSchema: MockRequestSchemaInitNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('PUT', reqSchema, resSchema);
  }

  async PATCH(reqSchema: MockRequestSchemaInitNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('PATCH', reqSchema, resSchema);
  }

  async DELETE(reqSchema: MockRequestSchemaInitNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('DELETE', reqSchema, resSchema);
  }

  async HEAD(reqSchema: MockRequestSchemaInitNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('HEAD', reqSchema, resSchema);
  }

  async ALL(reqSchema: MockRequestSchemaInitNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod(undefined, reqSchema, resSchema);
  }

  async reset() {
    this.mockSchemas = [];
    await this.rebuildHeaders();
  }

  private addMockWithMethod(
    method: MockRequestSchema['method'],
    reqSchema: MockRequestSchemaInitNoMethod,
    resSchema: MockResponseSchemaInit,
  ) {
    const obj = toRequestSchemaObjectInit(reqSchema);
    return this.addMock({ method, ...obj }, resSchema);
  }

  private async rebuildHeaders() {
    this._headers = buildMockHeaders(this.schemas);
    await this.onChange?.({ ...this._headers });
  }

  private buildRequestSchema(init: MockRequestSchemaInit) {
    const obj = toRequestSchemaObjectInit(init);
    const { debug } = this.options || {};
    const objWithDefaults = mergeOptions({ debug }, obj);
    return buildRequestSchema(objWithDefaults);
  }

  private buildResponseSchema(init: MockResponseSchemaInit) {
    // place to apply defaults
    return buildResponseSchema(init);
  }
}
