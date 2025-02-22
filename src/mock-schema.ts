import { RequestPatternInit } from './request-pattern';

export type RequestSchema = RequestPatternInit;

export type ResponseSchema = {
  status?: number;
  headers?: Record<string, string>;
  body?: BodyInit | Array<unknown> | Record<string, unknown>;
  bodyPatch?: Record<string, string | number | boolean | null>;
};

export type MockSchema = {
  reqSchema: RequestSchema;
  resSchema: ResponseSchema;
};
