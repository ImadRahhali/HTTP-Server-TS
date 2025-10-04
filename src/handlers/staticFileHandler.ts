import type { HttpRequest } from "../types.ts";
import path from "path";
import { promises as fs, createReadStream, Stats } from "fs";

const PUBLIC_DIR = path.resolve("public");

export async function serveStaticFile(
  req: HttpRequest,
  socket: any
): Promise<void> {
  let filePath: string;

  try {
    filePath = getSafePath(req.path);
  } catch (err) {
    return sendForbidden(socket);
  }

  try {
    const stats: Stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      const indexFile = path.join(filePath, "index.html");
      try {
        await fs.access(indexFile);
        return serveFile(req, socket, indexFile, stats);
      } catch {
        return send404(socket);
      }
    }

    return serveFile(req, socket, filePath, stats);
  } catch {
    return send404(socket);
  }
}

// Helper: Safely resolve URL path
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

// Helper: Serve file as stream, or HEAD headers
function serveFile(
  req: HttpRequest,
  socket: any,
  filePath: string,
  stats: Stats
) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = getMimeType(ext);

  const headers = [
    `HTTP/1.1 200 OK`,
    `Content-Type: ${contentType}`,
    `Content-Length: ${stats.size}`,
    "\r\n",
  ].join("\r\n");

  socket.write(headers);

  if (req.method.toUpperCase() === "HEAD") {
    socket.end();
    return;
  }

  const fileStream = createReadStream(filePath);
  fileStream.pipe(socket);

  fileStream.on("error", (err) => {
    console.error("[SERVER] Stream error:", err.message);
    socket.end();
  });

  fileStream.on("end", () => socket.end());
}

// Error responses
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

// MIME types
export function getMimeType(ext: string): string {
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
