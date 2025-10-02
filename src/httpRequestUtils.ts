type HttpRequest = {
  method: string;
  path: string;
  version: string;
  headers: Record<string, string>;
};

type HttpResponse = {
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string>;
  body: string;
};

const STATUS_MESSAGES: Record<number, string> = {
  200: "OK",
  201: "Created",
  301: "Moved Permanently",
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
};

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

  const request: HttpRequest = { method, path, version, headers };
  return request;
}

export function buildHttpResponse(
  statusCode: number,
  body: string,
  headers: Record<string, string> = {}
): HttpResponse {
  const statusMessage = STATUS_MESSAGES[statusCode] || "Unknown";
  headers["Content-Length"] = Buffer.byteLength(body).toString();
  headers["Content-Type"] = headers["Content-Type"] || "text/plain";

  return { statusCode, statusMessage, headers, body };
}

export function serializeHttpResponse(
  response: HttpResponse,
  version: string = "HTTP/1.1"
): string {
  const headerLines = Object.entries(response.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\r\n");

  return `${version} ${response.statusCode} ${response.statusMessage}\r\n${headerLines}\r\n\r\n${response.body}`;
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
