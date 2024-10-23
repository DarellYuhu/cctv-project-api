import app from "./app";

const server = Bun.serve({
  fetch: app.fetch,
  port: 3001,
});

console.log(`Listening on port: ${server.port}`);
