import type { HttpRequest } from "./types.ts";

export function parseHttpRequest(data: Buffer): HttpRequest | null {
  const text = data.toString();
  const headerEnd = text.indexOf("\r\n\r\n");

  if (headerEnd === -1) throw new Error("Incomplete request");

  const headerPart = text.slice(0, headerEnd);
  const lines = headerPart.split(/\r?\n/);

  if (lines.length === 0 || !lines[0]) return null;

  const requestLineParts = requestLineParser(lines[0]);
  if (!requestLineParts) return null;

  const [method, path, version] = requestLineParts;
  const headers = headersParser(lines);

  const body = parseBody(text.slice(headerEnd + 4), headers);

  return { method, path, version, headers, body };
}

function requestLineParser(line: string): [string, string, string] | null {
  const parts = line.trim().split(" ");
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
    console.error("Invalid request line:", line);
    return null;
  }
  return [parts[0], parts[1], parts[2]];
}

function headersParser(lines: string[]): Record<string, string> {
  const headers: Record<string, string> = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) break;

    const [rawKey, ...rawValue] = line.split(":");
    if (!rawKey || rawValue.length === 0) continue;

    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();
    headers[key] = value;
  }

  return headers;
}

function parseBody(
  bodyString: string,
  headers: Record<string, string>
): string {
  const transferEncoding = headers["transfer-encoding"];
  if (transferEncoding?.toLowerCase() === "chunked") {
    return parseChunkedBody(bodyString);
  }

  const contentLength = headers["content-length"];
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    if (bodyString.length < length) throw new Error("Incomplete body");
    return bodyString.slice(0, length);
  }

  return bodyString;
}

function parseChunkedBody(bodyString: string): string {
  let i = 0;
  let result = "";

  while (i < bodyString.length) {
    const crlfIndex = bodyString.indexOf("\r\n", i);
    if (crlfIndex === -1) break;

    const chunkSizeHex = bodyString.slice(i, crlfIndex).trim();
    const chunkSize = parseInt(chunkSizeHex, 16);
    if (isNaN(chunkSize)) throw new Error("Invalid chunk size");

    if (chunkSize === 0) break;

    const chunkStart = crlfIndex + 2;
    const chunkEnd = chunkStart + chunkSize;
    const chunkData = bodyString.slice(chunkStart, chunkEnd);

    console.log(
      "[CHUNKED] Size:",
      chunkSize,
      "Data:",
      JSON.stringify(chunkData)
    );

    result += chunkData;

    i = chunkEnd + 2;
  }

  return result;
}
