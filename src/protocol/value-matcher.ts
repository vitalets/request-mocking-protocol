/**
 * Value matcher types and helpers for the mocking protocol.
 * Shared by query, headers, body and url matching.
 */

/**
 * Generic value matcher, used by query, headers and body fields.
 * - `string` | `number`: match by exact equality (default).
 * - `{ $contains }`: match strings that include the given substring.
 * - `{ $regex }`: match strings against the given regular expression.
 */
export type ValueMatcher = string | number | { $contains: string } | { $regex: string };

/**
 * Value matcher accepted as input.
 * Like `ValueMatcher`, but also accepts a bare `RegExp` (shorthand for `{ $regex }`)
 * and a `RegExp` inside `$regex` — both converted to a string when building the schema.
 */
export type ValueMatcherInit =
  string | number | RegExp | { $contains: string } | { $regex: string | RegExp };

/**
 * Recursive JSON value that may contain a `ValueMatcher` ({ $contains } / { $regex }) at any leaf.
 */
export type JsonMatcherValue =
  ValueMatcher | boolean | null | { [key: string]: JsonMatcherValue } | JsonMatcherValue[];

/**
 * Recursive JSON value accepted as input, allowing `ValueMatcherInit` (with `RegExp`) at any leaf.
 */
export type JsonMatcherValueInit =
  | ValueMatcherInit
  | boolean
  | null
  | { [key: string]: JsonMatcherValueInit }
  | JsonMatcherValueInit[];

/**
 * Recursively converts RegExp values to the `{ $regex }` matcher (string form `/pattern/flags`),
 * so a matcher schema stays serializable over the wire.
 * - a bare `RegExp` value becomes `{ $regex: '/pattern/flags' }`.
 * - a `RegExp` inside an existing `{ $regex }` matcher is stringified in place.
 */
export function serializeRegExps(value: unknown): unknown {
  if (value instanceof RegExp) return { $regex: value.toString() };
  if (Array.isArray(value)) return value.map(serializeRegExps);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) =>
        key === '$regex' && val instanceof RegExp
          ? [key, val.toString()]
          : [key, serializeRegExps(val)],
      ),
    );
  }
  return value;
}
