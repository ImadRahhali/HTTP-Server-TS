import * as net from "net";
import { parseHttpRequest } from "./httpRequestParser.ts";
import {
  buildHttpResponse,
  serializeHttpResponse,
} from "./httpResponseBuilder.ts";
import { Router } from "./router.ts";
import type { HttpRequest } from "./types.ts";

const router = new Router();

// Register routes
router.register("GET", "/", (req: HttpRequest) =>
  buildHttpResponse(200, "<h1>Home Page</h1>", { "Content-Type": "text/html" })
);

router.register("GET", "/about", (req: HttpRequest) =>
  buildHttpResponse(200, "<h1>About Page</h1>", { "Content-Type": "text/html" })
);

// Server
export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", (data: Buffer) => {
    const request = parseHttpRequest(data);
    console.log("[SERVER] Received data from Client:", request);

    if (!request) {
      socket.write(
        serializeHttpResponse(buildHttpResponse(400, "<h1>Bad Request</h1>"))
      );
      return;
    }

    const response = router.handle(request);
    socket.write(serializeHttpResponse(response));
  });

  socket.on("end", () => {
    console.log("[SERVER] Client disconnected");
  });
  socket.on("error", (err) => {
    console.error("[SERVER] Server Socket error:", err.message);
  });
});
