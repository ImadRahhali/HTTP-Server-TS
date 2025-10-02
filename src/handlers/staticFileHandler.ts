import type { HttpRequest, HttpResponse } from "../types.ts";
import { buildHttpResponse } from "../httpResponseBuilder.ts";
import path from "path";
import { promises as fs } from "fs";

const PUBLIC_DIR = path.resolve("public");

export async function serveStaticFile(req: HttpRequest): Promise<HttpResponse> {
  const filePath = path.join(
    PUBLIC_DIR,
    req.path === "/" ? "index.html" : req.path
  );

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
