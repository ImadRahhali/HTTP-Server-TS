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
