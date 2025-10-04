import * as net from "net";
import {
  buildHttpResponse,
  serializeHttpResponse,
} from "../httpResponseBuilder.ts";
import type { HttpRequest } from "../types.js";

export async function servePostRequest(req: HttpRequest, socket: net.Socket) {
  const body = req.body || "<empty>";
  const response = buildHttpResponse(200, `You sent: ${body}`, {
    "Content-Type": "text/plain",
    "Content-Length": Buffer.byteLength(body).toString(),
  });
  socket.write(serializeHttpResponse(response));
  socket.end();
}
