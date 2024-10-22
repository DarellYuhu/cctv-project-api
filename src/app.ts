import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { FfmpegCommand } from "fluent-ffmpeg";
import { Stream } from "node-rtsp-stream";

const app = new Hono();
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const stream = new Stream({
  name: "test",
  streamUrl: "rtsp://103.151.177.247:300/rtsp-over-websocket",
  wsPort: 99999,
});

console.log(stream);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(evt, ws) {
        console.log(evt);
        ws.send(`hello ${evt.data}`);
      },
    };
  })
);

export default { fetch: app.fetch, websocket };
