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

export type Handler = (req: HttpRequest) => HttpResponse;

export type RouteTable = {
  [method: string]: {
    [path: string]: Handler;
  };
};
