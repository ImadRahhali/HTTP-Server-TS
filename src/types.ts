import type { Socket } from "net";

export type HttpRequest = {
  method: string;
  path: string;
  version: string;
  headers: Record<string, string>;
  body?: string;
};

export type HttpResponse = {
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string>;
  body: string;
};

export type Handler = (req: HttpRequest, socket: Socket) => Promise<void>;
