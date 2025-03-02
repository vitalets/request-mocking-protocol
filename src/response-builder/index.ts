/**
 * Base abstract class to mock response
 */
import {
  isPatchResponse,
  PatchResponseSchema,
  ReplaceResponseSchema,
  MockMatchResult,
} from '../protocol';
import { patchObject, wait } from './utils';
import { replacePlaceholders } from './placeholders';
import { toHeaders } from '../transport/utils';

// Universal shape for response object.
export type ResponseLike = {
  status: number;
  headers: Headers;
  json: () => Promise<Record<string, unknown>>;
};

export type ResponseCallbacks = {
  bypass: (req: Request) => Promise<ResponseLike>;
};

export async function buildMockResponse(
  { mockSchema, req, params }: MockMatchResult,
  callbacks: ResponseCallbacks,
) {
  const { resSchema } = mockSchema;

  const { body, status, headers } = isPatchResponse(resSchema)
    ? await patchRealResponse(resSchema, req, callbacks)
    : resSchema;

  const newHeaders = toHeaders(headers);
  const newBody = buildResponseBody(body, params, newHeaders);

  if (resSchema.delay) await wait(resSchema.delay);

  return { body: newBody, status, headers: newHeaders };
}

async function patchRealResponse(
  resSchema: PatchResponseSchema,
  req: Request,
  callbacks: ResponseCallbacks,
) {
  const res = await callbacks.bypass(req);
  // todo: match status? If response status is not 200, should we patch it?
  // todo: handle parse error
  const body = await res.json();
  patchObject(body, resSchema.bodyPatch);

  const { status, headers } = res;
  const newHeaders = new Headers(headers);
  newHeaders.delete('content-length');

  return { body, status, headers: newHeaders };
}

function buildResponseBody(
  body: ReplaceResponseSchema['body'],
  params: Record<string, string>,
  headers: Headers,
) {
  if (typeof body === 'string') {
    return String(replacePlaceholders(body, params));
  }

  if (!body) return null;

  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return JSON.stringify(body, (_, value) => {
    return typeof value === 'string' ? replacePlaceholders(value, params) : value;
  });
}

// export class BaseResponseBuilder<T extends ResponseLike> {
//   constructor(
//     protected options: ResponseBuilderOptions<T>,
//     protected matchResult: MockMatchResult,
//   ) {}

//   protected abstract bypassReq(req: Request): Promise<Response>;

//   protected get schema() {
//     return this.matchResult.mockSchema.resSchema;
//   }

//   async build() {
//     return isPatchResponse(this.schema)
//       ? this.patchResponse(this.schema)
//       : this.replaceResponse(this.schema);
//   }

//   // can be overwritten in child classes
//   // protected createResponse(body?: string | null, init?: ResponseInit) {
//   //   return new Response(body, init);
//   // }

//   protected async patchResponse({ bodyPatch }: PatchResponseSchema) {
//     const realResponse = await this.bypassReq(this.matchResult.req);
//     let body: Record<string, unknown>;
//     try {
//       body = await realResponse.clone().json();
//     } catch {
//       // todo: log error
//       return realResponse;
//     }
//     patchObject(body, bodyPatch);
//     const { status, headers } = realResponse;
//     headers.delete('content-length');

//     return this.replaceResponse({ body, status, headers });
//     // const mockBody = this.buildResponseBody(body);
//     // await this.delayIfNeeded();
//     // return this.createResponse(mockBody, { status, headers });
//   }

//   protected async replaceResponse({ body, status, headers }: ReplaceResponseSchema) {
//     const mockBody = this.buildResponseBody(body);
//     await this.delayIfNeeded();
//     return this.createResponse(mockBody, { status, headers });
//   }

//   /**
//    * Builds stringified response body with inserted params.
//    */
//   protected buildResponseBody(body: ReplaceResponseSchema['body'] = null) {
//     if (body === null) return null;

//     if (typeof body === 'string') {
//       return String(replacePlaceholders(body, this.matchResult.params));
//     }

//     // todo: set content type for json
//     return JSON.stringify(body, (_, value) => {
//       return typeof value === 'string'
//         ? replacePlaceholders(value, this.matchResult.params)
//         : value;
//     });
//   }

//   protected async delayIfNeeded() {
//     const { delay } = this.schema;
//     if (delay) await wait(delay);
//   }
// }
