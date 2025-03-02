/**
 * MockClient class.
 */
import {
  MockRequestSchema,
  MockRequestSchemaInit,
  MockResponseSchemaInit,
  MockSchema,
  buildMockRequestSchema,
  buildMockResponseSchema,
  toMockRequestSchemaObject,
} from '../protocol';
import { buildMockHeaders } from '../transport';
import { mergeOptions } from './utils';

export type MockClientOptions = {
  debug?: boolean;
  defaultMethod?: MockRequestSchema['method'];
};

export type MockRequestSchemaNoMethod = Omit<MockRequestSchemaInit, 'method'>;

export class MockClient {
  private mockSchemas = new Map<MockRequestSchemaInit, MockSchema>();
  public headers: Record<string, string> = {};
  public onChange?: (headers: Record<string, string>) => unknown;

  constructor(protected options?: MockClientOptions) {}

  async addMock(reqSchema: MockRequestSchemaInit, resSchema: MockResponseSchemaInit) {
    const mockSchema = {
      reqSchema: this.buildRequestSchema(reqSchema),
      resSchema: this.buildResponseSchema(resSchema),
    };
    this.mockSchemas.set(reqSchema, mockSchema);
    this.buildHeaders();
    await this.onChange?.(this.headers);
  }

  async GET(reqSchema: MockRequestSchemaNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('GET', reqSchema, resSchema);
  }

  async POST(reqSchema: MockRequestSchemaNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('POST', reqSchema, resSchema);
  }

  async PUT(reqSchema: MockRequestSchemaNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('PUT', reqSchema, resSchema);
  }

  async DELETE(reqSchema: MockRequestSchemaNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('DELETE', reqSchema, resSchema);
  }

  async HEAD(reqSchema: MockRequestSchemaNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod('HEAD', reqSchema, resSchema);
  }

  async ALL(reqSchema: MockRequestSchemaNoMethod, resSchema: MockResponseSchemaInit) {
    return this.addMockWithMethod(undefined, reqSchema, resSchema);
  }

  private addMockWithMethod(
    method: MockRequestSchema['method'],
    reqSchema: MockRequestSchemaNoMethod,
    resSchema: MockResponseSchemaInit,
  ) {
    const initObj = toMockRequestSchemaObject(reqSchema as MockRequestSchemaInit);
    return this.addMock({ ...initObj, method }, resSchema);
  }

  private buildHeaders() {
    const mockSchemas = [...this.mockSchemas.values()];
    this.headers = buildMockHeaders(mockSchemas);
  }

  private buildRequestSchema(init: MockRequestSchemaInit) {
    const initObj = toMockRequestSchemaObject(init);
    const { defaultMethod: method, debug } = this.options || {};
    const initObjWithDefaults = mergeOptions({ method, debug }, initObj);
    return buildMockRequestSchema(initObjWithDefaults);
  }

  private buildResponseSchema(init: MockResponseSchemaInit) {
    // place to apply defaults
    return buildMockResponseSchema(init);
  }
}
