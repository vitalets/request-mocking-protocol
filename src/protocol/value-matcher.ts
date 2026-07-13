/**
 * Value matcher types for the mocking protocol.
 * Shared by query, headers and url matching.
 */

/**
 * Matches strings that include the given substring.
 */
export type ContainsMatcher = { $contains: string };

/**
 * Matches strings against the given regular expression.
 */
export type RegexMatcher = { $regex: string };

/**
 * Generic value matcher, used by query and headers fields.
 * - `string` | `number`: match by exact equality (default).
 * - `{ $contains }`: match strings that include the given substring.
 * - `{ $regex }`: match strings against the given regular expression.
 */
export type ValueMatcher = string | number | ContainsMatcher | RegexMatcher;

/**
 * Value matcher accepted as input.
 * Like `ValueMatcher`, but also accepts a bare `RegExp` as a shorthand for `{ $regex }`
 * (converted to a serializable string when building the schema).
 */
export type ValueMatcherInit = string | number | RegExp | ContainsMatcher | RegexMatcher;

/**
 * Recursive plain JSON value, used by the request body field.
 * The body is matched as plain data (exact / subset), without value matchers.
 */
export type JsonValue =
  string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];
