type HttpRequest = {
  method: string;
  path: string;
  version: string;
  headers: Record<string, string>;
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
