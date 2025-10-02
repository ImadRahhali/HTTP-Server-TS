import * as net from "net";

export const server = net.createServer((socket: net.Socket) => {
  console.log(
    `[SERVER] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on("data", (data) => {
    console.log("[SERVER] Received data from Client:", data.toString());
    socket.write("[SERVER] Hello From TCP server!\n");
  });

  socket.on("end", () => {
    console.log("[SERVER] Client disconnected");
  });
  socket.on("error", (err) => {
    console.error("[SERVER] Server Socket error:", err);
  });
});
