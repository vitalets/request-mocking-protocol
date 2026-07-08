/**
 * Generic value matcher implementation, shared by query, headers and body matchers.
 */
import type { ValueMatcher } from '../protocol';

export function isValueMatcher(v: unknown): v is { $$contains: string } | { $$regex: string } {
  if (!v || typeof v !== 'object') return false;
  const keys = Object.keys(v);
  return keys.length === 1 && (keys[0] === '$$contains' || keys[0] === '$$regex');
}

export function matchValue(expected: ValueMatcher, actual: unknown): boolean {
  if (isValueMatcher(expected)) return matchOperator(expected, actual);
  if (actual === undefined || actual === null) return false;
  return String(actual) === String(expected);
}

function matchOperator(matcher: { $$contains: string } | { $$regex: string }, actual: unknown) {
  if (typeof actual !== 'string') return false;
  return '$$contains' in matcher
    ? actual.includes(matcher.$$contains)
    : regexpFromString(matcher.$$regex).test(actual);
}

/**
 * Builds a RegExp from a string.
 * Accepts either a plain pattern ('foo.*') or a '/pattern/flags' form (consistent with URL's regexp matching).
 * The '/pattern/flags' form is only used when the trailing part contains valid regex flags,
 * so a plain pattern that merely starts with '/' is not misinterpreted.
 */
export function regexpFromString(s: string) {
  const wrapped = /^\/(.*)\/([dgimsuy]*)$/s.exec(s);
  if (!wrapped) return new RegExp(s);
  const [, source = '', flags = ''] = wrapped;
  return new RegExp(source, flags);
}
