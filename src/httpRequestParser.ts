import type { HttpRequest } from "./types.ts";

export function parseHttpRequest(data: Buffer): HttpRequest | null {
  const lines = data.toString().split(/\r?\n/);

  if (lines.length === 0 || !lines[0]) {
    console.error("Empty request");
    return null;
  }

  const requestLineParts = requestLineParser(lines[0]);
  if (!requestLineParts) return null;

  const [method, path, version] = requestLineParts;

  const headers = headersParser(lines);

  const body = parseBody(lines, headers);

  const request: HttpRequest = { method, path, version, headers, body };
  return request;
}

function requestLineParser(line: string): [string, string, string] | null {
  const parts = line.trim().split(" ");
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
    console.error("Invalid request line:", line);
    return null;
  }
  return [parts[0], parts[1], parts[2]];
}

function headersParser(lines: string[]) {
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

function parseBody(lines: string[], headers: Record<string, string>): string {
  const emptyLineIndex = lines.findIndex((line) => line.trim() === "");
  if (emptyLineIndex < 0) return "";

  let body = lines.slice(emptyLineIndex + 1).join("\n");

  const contentLength = headers["Content-Length"] || headers["content-length"];
  if (contentLength) {
    const expectedLength = parseInt(contentLength, 10);
    if (!isNaN(expectedLength)) {
      body = body.slice(0, expectedLength);
    }
  }

  return body;
}
