/**
 * Transport mock schemas via HTTP headers.
 */
import { MockSchema } from '../protocol';
import { HeadersLike, toHeaders } from './utils';

const MOCK_HEADER = 'x-mock-request';

type Maybe<T> = T | undefined;
export type GetHeaders = () => Maybe<HeadersLike> | Promise<Maybe<HeadersLike>>;

export function buildMockHeaders(mockSchemas: MockSchema[]) {
  return { [MOCK_HEADER]: JSON.stringify(mockSchemas) };
}

export async function extractMockSchemas(getHeaders: GetHeaders) {
  const headersLike = await getHeaders();
  if (!headersLike) return;

  const headers = toHeaders(headersLike);
  try {
    const mockingHeader = headers.get(MOCK_HEADER);
    if (!mockingHeader) return;

    return JSON.parse(mockingHeader) as MockSchema[];
  } catch {
    // do nothing
  }
}
