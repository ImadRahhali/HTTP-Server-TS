type httpRequest = {
  method: string;
  path: string;
  version: string;
  // TODO: add headers attribute and body
};

export function parseHttpRequest(data: Buffer): httpRequest | null {
  const lines = data.toString().split("\r\n");

  if (lines.length === 0 || !lines[0]) {
    console.error("Empty request");
    return null;
  }

  const requestLineParts = lines[0].trim().split(" ");

  if (
    requestLineParts.length < 3 ||
    !requestLineParts[0] ||
    !requestLineParts[1] ||
    !requestLineParts[2]
  ) {
    console.error("Invalid request line:", lines[0]);
    return null;
  }

  const [method, path, version] = requestLineParts;

  const request: httpRequest = {
    method: method,
    path: path,
    version: version,
  };
  return request;
}

export function buildHttpResponse() {
  // TODO: create a build http response that the server will use to respond to http client request (based on the extracted infos we got using parsingHttpRequest function)
}
