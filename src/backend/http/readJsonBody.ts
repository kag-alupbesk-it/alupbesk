const MAX_JSON_BODY_BYTES = 1024 * 1024;

export async function readJsonBody(request: Request): Promise<unknown | null> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BODY_BYTES) {
    return null;
  }

  if (!request.body) return null;

  try {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_JSON_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }

    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return JSON.parse(new TextDecoder().decode(body)) as unknown;
  } catch {
    return null;
  }
}
