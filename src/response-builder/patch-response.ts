/**
 * Patches an existing response using a MockResponseSchema.
 */
import { MockResponseSchema } from '../protocol';
import { cloneWithPlaceholders, replacePlaceholders } from './placeholders';
import { patchObject } from './utils';

type RealResponse = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

export type PatchResponseResult = {
  status: number;
  headers: Record<string, string>;
  body: string | null;
};

/**
 * Applies a MockResponseSchema's patches onto an already-received response.
 * Pure function — no side effects, no network, no Node.js APIs.
 */
export function patchResponse(
  resSchema: MockResponseSchema,
  realResponse: RealResponse,
  params: Record<string, string> = {},
): PatchResponseResult {
  const status = resSchema.status ?? realResponse.status;
  const headers = patchHeaders(resSchema, realResponse.headers, params);
  const body = patchBody(resSchema, realResponse.body, params);
  return { status, headers, body };
}

function patchHeaders(
  resSchema: MockResponseSchema,
  baseHeaders: Record<string, string>,
  params: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = { ...baseHeaders };
  for (const [key, value] of Object.entries(resSchema.headers || {})) {
    if (value) {
      headers[key] = replacePlaceholders(value, params);
    } else {
      delete headers[key];
    }
  }
  return headers;
}

function patchBody(
  resSchema: MockResponseSchema,
  baseBody: string,
  params: Record<string, string>,
): string | null {
  const { bodyPatch } = resSchema;
  if (!bodyPatch) return baseBody;
  const parsed = JSON.parse(baseBody) as Record<string, unknown>;
  const patchFinal = cloneWithPlaceholders(bodyPatch, params);
  patchObject(parsed, patchFinal);
  return JSON.stringify(parsed);
}
