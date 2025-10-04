import { serveStaticFile } from "./handlers/staticFileHandler.ts";
import { buildHttpResponse } from "./httpResponseBuilder.ts";
import type { HttpRequest, HttpResponse, Handler } from "./type.ts";

export class Router {
  private routes: Record<string, Record<string, Handler>> = {};

  register(method: string, path: string, handler: Handler) {
    method = method.toUpperCase();
    if (!this.routes[method]) {
      this.routes[method] = {};
    }
    (this.routes[method] ??= {})[path] = handler;
  }

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const methodRoutes = this.routes[req.method.toUpperCase()];

    if (!methodRoutes) {
      if (req.method.toUpperCase() === "GET") {
        return await serveStaticFile(req);
      }
      return buildHttpResponse(404, "<h1>Not Found</h1>");
    }

    const handler = methodRoutes[req.path];
    if (handler) {
      return await handler(req);
    }

    if (req.method.toUpperCase() === "GET") {
      return await serveStaticFile(req);
    }

    return buildHttpResponse(404, "<h1>Not Found</h1>");
  }
}
