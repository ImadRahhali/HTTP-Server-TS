import * as net from "net";
import { parseHttpRequest } from "./httpRequestParser.ts";
import {
  buildHttpResponse,
  serializeHttpResponse,
} from "./httpResponseBuilder.ts";
import { Router } from "./router.ts";
import { serveStaticFile } from "./handlers/staticFileHandler.ts";
import type { HttpRequest } from "./types.ts";

const router = new Router();

router.register("GET", "/", serveStaticFile);
router.register("GET", "/index.html", serveStaticFile);
router.register("GET", "/about.html", serveStaticFile);

router.register("POST", "/echo", (req: HttpRequest) => {
  const body = req.body || "<empty>";
  return buildHttpResponse(200, `You sent: ${body}`, {
    "Content-Type": "text/plain",
  });
});

export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", async (data: Buffer) => {
    const request = parseHttpRequest(data);
    console.log("[SERVER] Received data from Client:", request);

    if (!request) {
      socket.write(
        serializeHttpResponse(buildHttpResponse(400, "<h1>Bad Request</h1>"))
      );
      return;
    }

    const response = await router.handle(request);
    socket.write(serializeHttpResponse(response));
  });

  socket.on("end", () => {
    console.log("[SERVER] Client disconnected");
  });
  socket.on("error", (err) => {
    console.error("[SERVER] Server Socket error:", err.message);
  });
});
