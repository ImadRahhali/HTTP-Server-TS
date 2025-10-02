import * as net from "net";
import { parseHttpRequest } from "./httpRequestParser.ts";
import {
  buildHttpResponse,
  serializeHttpResponse,
} from "./httpResponseBuilder.ts";
export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", (data: Buffer) => {
    const request = parseHttpRequest(data);
    console.log("[SERVER] Received data from Client:", request);

    if (!request) {
      const response = buildHttpResponse(400, "Bad Request");
      socket.end(serializeHttpResponse(response));
      return;
    }

    if (request.path === "/index.html") {
      const response = buildHttpResponse(200, "<h1>Hello</h1>", {
        "Content-Type": "text/html",
      });
      socket.write(serializeHttpResponse(response));
    } else {
      const response = buildHttpResponse(404, "Not Found");

      socket.write(serializeHttpResponse(response));
    }
  });

  socket.on("end", () => {
    console.log("[SERVER] Client disconnected");
  });
  socket.on("error", (err) => {
    console.error("[SERVER] Server Socket error:", err);
  });
});
