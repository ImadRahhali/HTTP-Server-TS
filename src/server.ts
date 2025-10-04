import * as net from "net";
import { parseHttpRequest } from "./httpRequestParser.ts";
import { Router } from "./router.ts";
import { serveStaticFile } from "./handlers/staticFileHandler.ts";
import { servePostRequest } from "./handlers/postRequestHandler.ts";
import type { HttpRequest } from "./types.ts";

const router = new Router();

router.register("GET", "/", serveStaticFile);
router.register("GET", "/index.html", serveStaticFile);
router.register("GET", "/about.html", serveStaticFile);
router.register("POST", "/echo", servePostRequest);

const KEEP_ALIVE_TIMEOUT = 5000; // 5s idle time before closing socket

export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  let buffer = Buffer.from([]);
  let keepAlive = false; // Track whether to keep the connection open

  // Set an idle timeout (reset when data is received)
  socket.setTimeout(KEEP_ALIVE_TIMEOUT);
  socket.on("timeout", () => {
    console.log("[SERVER] Socket idle timeout, closing connection");
    socket.end();
  });

  socket.on("data", async (chunk: Buffer) => {
    console.log("[SERVER] Raw data chunk received:", chunk.toString());
    buffer = Buffer.concat([buffer, chunk]);

    let request: HttpRequest | null;
    try {
      request = parseHttpRequest(buffer);
    } catch {
      // Incomplete request — wait for more data
      return;
    }

    if (!request) {
      socket.write(
        "HTTP/1.1 400 Bad Request\r\nContent-Type: text/html\r\n\r\n<h1>Bad Request</h1>"
      );
      socket.end();
      buffer = Buffer.from([]);
      return;
    }

    keepAlive = request.headers["connection"]?.toLowerCase() === "keep-alive";

    try {
      await router.handle(request, socket);

      // Remove processed bytes from buffer
      const contentLength = request.headers["content-length"];
      const bodyLength = contentLength ? parseInt(contentLength, 10) : 0;
      const headerEndIndex = buffer.indexOf("\r\n\r\n") + 4;
      const totalRequestLength = headerEndIndex + bodyLength;
      buffer = buffer.slice(totalRequestLength);

      if (!keepAlive) {
        socket.end();
      } else {
        socket.setTimeout(KEEP_ALIVE_TIMEOUT);
        console.log("[SERVER] Connection kept alive");
      }
    } catch (err) {
      console.error("[SERVER] Error handling request:", err);
      socket.write(
        "HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/html\r\n\r\n<h1>Server Error</h1>"
      );
      socket.end();
      buffer = Buffer.from([]);
    }
  });

  socket.on("end", () => {
    console.log("[SERVER] Client finished sending data (FIN received)");
  });

  socket.on("close", (hadError) => {
    console.log("[SERVER] Socket fully closed", hadError ? "due to error" : "");
  });

  socket.on("error", (err) => {
    console.error("[SERVER] Socket error:", err.message);
  });
});
