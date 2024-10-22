import app from "./app";

const server = Bun.serve({
  fetch: app.fetch,
  port: 3000,
  websocket: app.websocket,
});

console.log(`Listening on port: ${server.port}`);
