import { RequestPatternInit } from './request-pattern';

export type RequestSchema = RequestPatternInit;

export type ResponseSchema = {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
};

export type MockSchema = {
  reqSchema: RequestSchema;
  resSchema: ResponseSchema;
};
