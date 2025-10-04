import * as net from "net";
import { parseHttpRequest } from "./httpRequestParser.ts";
import { Router } from "./router.ts";
import { serveStaticFile } from "./handlers/staticFileHandler.ts";
import type { HttpRequest } from "./types.ts";
import {
  buildHttpResponse,
  serializeHttpResponse,
} from "./httpResponseBuilder.ts";

const router = new Router();

router.register("GET", "/", serveStaticFile);
router.register("GET", "/index.html", serveStaticFile);
router.register("GET", "/about.html", serveStaticFile);

router.register(
  "POST",
  "/echo",
  async (req: HttpRequest, socket: net.Socket) => {
    const body = req.body || "<empty>";
    const response = buildHttpResponse(200, `You sent: ${body}`, {
      "Content-Type": "text/plain",
    });
    socket.write(serializeHttpResponse(response));
  }
);

export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", async (data: Buffer) => {
    const request = parseHttpRequest(data);
    console.log("[SERVER] Received data from Client:", request);

    if (!request) {
      socket.write(
        "HTTP/1.1 400 Bad Request\r\nContent-Type: text/html\r\n\r\n<h1>Bad Request</h1>"
      );
      socket.end();
      return;
    }

    try {
      await router.handle(request, socket);
    } catch (err) {
      console.error("[SERVER] Error handling request:", err);
      socket.write(
        "HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/html\r\n\r\n<h1>Server Error</h1>"
      );
      socket.end();
    }
  });

  socket.on("end", () => {
    console.log("[SERVER] Client disconnected");
  });

  socket.on("error", (err) => {
    console.error("[SERVER] Server Socket error:", err.message);
  });
});
