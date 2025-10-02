import { server } from "./server.ts";

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
});
