/**
 * MockServerRequest class.
 */
import { MockSchema, RequestSchema, ResponseSchema } from './mock-schema';
import { PatternType } from './request-pattern';

export type MockServerRequestOptions = {
  patternType: PatternType;
};

export class MockServerRequest {
  private mockSchemas: MockSchema[] = [];
  public headers: Record<string, string> = {};
  public onChange?: (headers: Record<string, string>) => unknown;

  constructor(protected options?: MockServerRequestOptions) {}

  // todo: GET()

  async addMock(reqSchema: RequestSchema, resSchema: ResponseSchema) {
    // todo: add default patternType from options
    this.mockSchemas.push({ reqSchema, resSchema });
    this.headers = { ['x-mock-request']: JSON.stringify(this.mockSchemas) };
    await this.onChange?.(this.headers);
  }
}
