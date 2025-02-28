/**
 * MockRemoteRequest class.
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

export type MockRemoteRequestOptions = {
  debug?: boolean;
  defaultMethod?: MockRequestSchema['method'];
};

export class MockRemoteRequest {
  private mockSchemas = new Map<MockRequestSchemaInit, MockSchema>();
  public headers: Record<string, string> = {};
  public onChange?: (headers: Record<string, string>) => unknown;

  constructor(protected options?: MockRemoteRequestOptions) {}

  // todo: GET()

  async addMock(reqSchemaInit: MockRequestSchemaInit, resSchemaInit: MockResponseSchemaInit) {
    const reqSchema = this.buildRequestSchema(reqSchemaInit);
    const resSchema = this.buildResponseSchema(resSchemaInit);
    this.mockSchemas.set(reqSchemaInit, { reqSchema, resSchema });
    this.buildHeaders();
    await this.onChange?.(this.headers);
  }

  private buildHeaders() {
    const mockSchemas = [...this.mockSchemas.values()];
    this.headers = buildMockHeaders(mockSchemas);
  }

  private buildRequestSchema(reqSchemaInit: MockRequestSchemaInit) {
    const initObj = toMockRequestSchemaObject(reqSchemaInit);
    const { defaultMethod: method, debug } = this.options || {};
    const initObjWithDefaults = mergeOptions({ method, debug }, initObj);
    return buildMockRequestSchema(initObjWithDefaults);
  }

  private buildResponseSchema(resSchemaInit: MockResponseSchemaInit) {
    // place to apply defaults
    return buildMockResponseSchema(resSchemaInit);
  }
}
