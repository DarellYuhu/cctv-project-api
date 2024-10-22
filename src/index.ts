import app from "./app";

const server = Bun.serve({
  fetch: app.fetch,
  port: 3001,
  websocket: {
    open(ws) {
      app.io.attach(ws);
    },
  },
});

console.log(`Listening on port: ${server.port}`);
