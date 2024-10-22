import { Hono } from "hono";
import { cors } from "hono/cors";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import Ffmpeg = require("fluent-ffmpeg");
import { PassThrough } from "stream";

const app = new Hono();
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
const ffmpegStream = new PassThrough();
Ffmpeg("rtsp://141.11.241.65:326/axis-media/media.amp")
  .inputOptions(["-rtsp_transport tcp"]) // Use TCP transport for RTSP
  .outputFormat("mpegts") // Transcoding to MPEG-TS format for streaming
  .videoCodec("libx264") // Video codec (H.264)
  .audioCodec("aac")
  .on("start", (d) => {
    console.log(d);
  })
  .on("progress", (p) => {
    console.log(p.currentKbps);
  })
  .on("error", (err) => {
    console.error("Error: " + err.message);
  })
  .pipe(ffmpegStream);

app.use(cors({ origin: ["http://localhost:3000", "*"] }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(evt, ws) {
        ws.send(`hello ${evt.data}`);
      },
      onOpen(evt, ws) {
        ffmpegStream.on("data", (data) => {
          ws.send(data);
        });
      },
    };
  })
);

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(evt, ws) {
        ws.send(`hello ${evt.data}`);
      },
      onOpen(evt, ws) {
        ffmpegStream.on("data", (data) => {
          ws.send(data);
        });
      },
    };
  })
);

export default { fetch: app.fetch, websocket };
