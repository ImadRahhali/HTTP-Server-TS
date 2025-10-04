import type { HttpRequest, HttpResponse } from "../types.ts";
import { buildHttpResponse } from "../httpResponseBuilder.ts";
import path from "path";
import { promises as fs } from "fs";

const PUBLIC_DIR = path.resolve("public");

export async function serveStaticFile(req: HttpRequest): Promise<HttpResponse> {
  const filePath = getSafePath(req.path);

  try {
    const data = await fs.readFile(filePath, "utf-8");
    const ext = path.extname(filePath).toLowerCase();
    const contentType = getMimeType(ext);
    return buildHttpResponse(200, data, { "Content-Type": contentType });
  } catch (err) {
    return buildHttpResponse(404, "<h1>Not Found</h1>", {
      "Content-Type": "text/html",
    });
  }
}

function getSafePath(urlPath: string): string {
  const rawPath = urlPath.split("?")[0] || "/";
  const decodedPath = decodeURIComponent(rawPath);
  const resolvedPath = path.resolve(PUBLIC_DIR, "." + decodedPath);
  const relativePath = path.relative(PUBLIC_DIR, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Forbidden: Path traversal detected");
  }
  return resolvedPath;
}

function send404(socket: any) {
  socket.write(
    "HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n<h1>Not Found</h1>"
  );
  socket.end();
}

function sendForbidden(socket: any) {
  socket.write(
    "HTTP/1.1 403 Forbidden\r\nContent-Type: text/html\r\n\r\n<h1>Forbidden</h1>"
  );
  socket.end();
}

function getMimeType(ext: string): string {
  switch (ext) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "text/plain";
  }
}
