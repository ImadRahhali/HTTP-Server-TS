import type { Socket } from "net";
import { serveStaticFile } from "./handlers/staticFileHandler.ts";
import type { Handler, HttpRequest } from "./types.js";

export class Router {
  private routes: Record<string, Record<string, Handler>> = {};

  register(method: string, path: string, handler: Handler) {
    method = method.toUpperCase();
    if (!this.routes[method]) this.routes[method] = {};
    if (!this.routes[method]) {
      this.routes[method] = {};
    }
    (this.routes[method] ??= {})[path] = handler;
  }

  async handle(req: HttpRequest, socket: Socket): Promise<void> {
    const methodRoutes = this.routes[req.method.toUpperCase()];

    if (!methodRoutes) {
      if (req.method.toUpperCase() === "GET") {
        return serveStaticFile(req, socket);
      }
      return send404(socket);
    }

    const handler = methodRoutes[req.path];
    if (handler) {
      return handler(req, socket);
    }

    if (req.method.toUpperCase() === "GET") {
      return serveStaticFile(req, socket);
    }

    return send404(socket);
  }
}

function send404(socket: Socket) {
  socket.write(
    "HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n<h1>Not Found</h1>"
  );
  socket.end();
}
