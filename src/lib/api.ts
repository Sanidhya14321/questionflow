import { NextResponse } from 'next/server';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number) { super(message); }
}

/** Bound the actual stream as well as Content-Length, which clients can omit. */
export async function readJson(request: Request, maximumBytes = 64 * 1024): Promise<unknown> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'Send application/json.');
  if (Number(request.headers.get('content-length')) > maximumBytes) throw new ApiError(413, 'Request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'A JSON body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) { await reader.cancel(); throw new ApiError(413, 'Request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ApiError(400, 'Invalid JSON.'); }
}

export function apiError(error: unknown, context: string) {
  if (error instanceof ApiError) return NextResponse.json({ message: error.message }, { status: error.status, headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined });
  if (error instanceof z.ZodError) return NextResponse.json({ message: 'Invalid input.', issues: error.issues.map(i => ({ path: i.path, message: i.message })) }, { status: 400 });
  const requestId = crypto.randomUUID();
  console.error(JSON.stringify({ context, requestId, errorType: error instanceof Error ? error.name : 'UnknownError' }));
  return NextResponse.json({ message: 'The service is temporarily unavailable. Please try again.', requestId }, { status: 503 });
}
