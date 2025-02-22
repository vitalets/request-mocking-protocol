import { RequestPatternInit } from './request-pattern';

export type RequestSchema = RequestPatternInit;

export type ResponseSchema = {
  status?: number;
  headers?: Record<string, string>;
  // only serializable body types
  body?: Record<string, unknown> | Array<unknown> | string | null | undefined;
  bodyPatch?: Record<string, string | number | boolean | null>;
};

export type MockSchema = {
  reqSchema: RequestSchema;
  resSchema: ResponseSchema;
};
