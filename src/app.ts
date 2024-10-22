import { Hono } from "hono";
import { cors } from "hono/cors";
import { createBunWebSocket, serveStatic } from "hono/bun";
import { spawn, type ServerWebSocket } from "bun";
import Ffmpeg = require("fluent-ffmpeg");
import { PassThrough } from "stream";
import * as path from "path";
import * as fs from "fs-extra";
import { Server } from "socket.io";
import ffmpeg from "ffmpeg-static";

const videoFolder = path.join(process.cwd(), "../hls");

fs.ensureDirSync(videoFolder);

const app = new Hono();
const io = new Server({
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

function startHLSStream() {
  const ffmpegProcess = spawn({
    cmd: [
      "ffmpeg",
      "-i",
      "rtsp://141.11.241.65:326/axis-media/media.amp", // RTSP stream from the camera
      "-profile:v",
      "baseline", // H264 baseline profile for compatibility
      "-level",
      "3.0",
      "-start_number",
      "0",
      "-hls_time",
      "2", // Duration of each segment in seconds
      "-hls_list_size",
      "0", // No limit on the number of segments
      "-hls_flags",
      "delete_segments", // Automatically delete old segments
      "-f",
      "hls", // Output format HLS
      `${videoFolder}/index.m3u8`, // Output HLS playlist
    ],
    stdout: "pipe",
    stderr: "pipe",
  });
  ffmpegProcess.stdout.pipeTo(
    new WritableStream({
      write(chunk) {
        console.log(new TextDecoder().decode(chunk));
      },
    })
  );

  ffmpegProcess.stderr.pipeTo(
    new WritableStream({
      write(chunk) {
        console.error(new TextDecoder().decode(chunk));
      },
    })
  );
}

startHLSStream();

app.use(cors({ origin: ["http://localhost:3000", "*"] }));
app.use("/hls/*", serveStatic({ root: "./hls" }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.fire();

export default { fetch: app.fetch, io };
