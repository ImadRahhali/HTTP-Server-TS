import * as net from "net";
import { parseHttpRequest, buildHttpResponse } from "./httpRequestUtils.ts";

export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", (data: Buffer) => {
    const request = parseHttpRequest(data);
    console.log("[SERVER] Received data from Client:", request);

    if (!request) {
      socket.end(buildHttpResponse(400, "Bad Request"));
      return;
    }

    if (request.path === "/index.html") {
      const response = buildHttpResponse(
        200,
        "<h1>Hello World</h1>",
        request.version,
        {
          "Content-Type": "text/html",
        }
      );
      socket.write(response);
    } else {
      const response = buildHttpResponse(404, "Not Found", request.version);

      socket.write(response);
    }
  });

  socket.on("end", () => {
    console.log("[SERVER] Client disconnected");
  });
  socket.on("error", (err) => {
    console.error("[SERVER] Server Socket error:", err);
  });
});
