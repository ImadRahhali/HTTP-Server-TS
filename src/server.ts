import * as net from "net";
import { parseHttpRequest } from "./httpRequestUtils.js";

export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", (data: Buffer) => {
    const request = parseHttpRequest(data);
    console.log("[SERVER] Received data from Client:", request);
    // TODO: Use the build http request to write (socket.write) the response
    socket.write("[SERVER] Hello From TCP server!\n");
  });

  socket.on("end", () => {
    console.log("[SERVER] Client disconnected");
  });
  socket.on("error", (err) => {
    console.error("[SERVER] Server Socket error:", err);
  });
});

// TODO: test with curl to see if the server behaves like a real HTTP Server
