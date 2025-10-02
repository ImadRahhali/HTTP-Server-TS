import * as net from "net";

const PORT = 4000;
const HOST = "localhost";

const client = net.createConnection({ host: HOST, port: PORT }, () => {
  console.log(`[CLIENT] Connected to server at ${HOST}:${PORT}`);

  client.write(`GET /about HTTP/1.1\r
Host: localhost:4000\r
Connection: keep-alive\r
\r
`);
});

client.on("data", (data) => {
  console.log("[CLIENT] Received from server:", data.toString());

  client.end();
});

client.on("end", () => {
  console.log("[CLIENT] Disconnected from ther server");
});

client.on("error", (err) => {
  console.error("[CLIENT] Error:", err);
});
