/**
 * Builds a static response from a MockResponseSchema.
 */
import { MockResponseSchema } from '../protocol';
import { STATUS_TEXTS } from './status-codes';
import { replacePlaceholders, stringifyWithPlaceholders } from './placeholders';

export type BuildResponseResult = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string | null;
};

/**
 * Builds a complete response from a MockResponseSchema.
 * Pure function — no side effects, no network, no Node.js APIs.
 * Does not set content-type or content-length; callers handle that if needed.
 */
export function buildResponse(
  resSchema: MockResponseSchema,
  params: Record<string, string> = {},
): BuildResponseResult {
  const status = resSchema.status ?? 200;
  const statusText = STATUS_TEXTS[status] ?? 'Unknown';
  const headers = buildHeaders(resSchema, params);
  const body = buildBody(resSchema, params);
  return { status, statusText, headers, body };
}

function buildHeaders(
  resSchema: MockResponseSchema,
  params: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(resSchema.headers || {})) {
    if (value) headers[key] = replacePlaceholders(value, params);
  }
  return headers;
}

function buildBody(resSchema: MockResponseSchema, params: Record<string, string>): string | null {
  const { body: bodySchema } = resSchema;
  if (!bodySchema) return null;
  return typeof bodySchema === 'string'
    ? replacePlaceholders(bodySchema, params)
    : stringifyWithPlaceholders(bodySchema, params);
}
