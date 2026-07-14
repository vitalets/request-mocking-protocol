/**
 * Generic value matcher implementation, shared by url, query and headers matchers.
 */
import type {
  ContainsMatcher,
  RegexMatcher,
  ValueMatcher,
  ValueMatcherInit,
} from '../value-matcher';

export function isValueMatcher(v: unknown): v is ContainsMatcher | RegexMatcher {
  if (!v || typeof v !== 'object') return false;
  const keys = Object.keys(v);
  return keys.length === 1 && (keys[0] === '$contains' || keys[0] === '$regex');
}

export function matchValue(expected: ValueMatcher, actual: unknown): boolean {
  if (isValueMatcher(expected)) return matchOperator(expected, actual);
  if (actual === undefined || actual === null) return false;
  return String(actual) === String(expected);
}

function matchOperator(matcher: ContainsMatcher | RegexMatcher, actual: unknown) {
  if (typeof actual !== 'string') return false;
  return '$contains' in matcher
    ? actual.includes(matcher.$contains)
    : regexpFromString(matcher.$regex).test(actual);
}

/**
 * Converts a bare `RegExp` to a serializable `{ $regex }` matcher.
 * Passes through null and undefined.
 */
export function serializeRegexp<T>(value: T) {
  return (value instanceof RegExp ? { $regex: value.toString() } : value) as T extends RegExp
    ? RegexMatcher
    : T;
}

/**
 * Serializes bare regular expressions in a matcher record.
 * Passes through null and undefined.
 */
export function serializeRegexpInRecord(
  record: Record<string, ValueMatcherInit | null> | null | undefined,
) {
  if (record === null || record === undefined) return record;
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, serializeRegexp(value)]),
  );
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
