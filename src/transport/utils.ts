export type HeadersLike =
  | Headers
  | Record<string, string | string[] | undefined>
  | Iterable<[string, string | string[] | undefined]>;

/**
 * Convert object to Headers instance.
 */
export function toHeaders(headersLike: HeadersLike = {}): Headers {
  if (headersLike instanceof Headers) return headersLike;

  const headers = new Headers();
  for (const [key, value] of Object.entries(headersLike)) {
    if (Array.isArray(value)) {
      value.forEach((val) => headers.append(key, val));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  return headers;
}
