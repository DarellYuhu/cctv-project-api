import Ffmpeg = require("fluent-ffmpeg");
import * as path from "path";

const hlsOutputDir = path.join(__dirname, "../hls-output");
const hlsPlaylistName = "stream.m3u8";
const rtspUrl =
  "rtsp://rtspstream:18bcf81599fef7df2501a8523376a4f4@zephyr.rtsp.stream/movie";

export default function startRTSPtoHLS() {
  Ffmpeg(rtspUrl)
    .inputOptions([
      "-rtsp_transport",
      "tcp", // Use TCP for RTSP transport (more reliable, but you can use UDP)
      "-buffer_size",
      "1024000",
    ])
    .outputOptions([
      "-preset",
      "veryfast", // Optimize for speed, adjust based on your requirements
      "-g",
      "50", // Keyframe interval
      "-sc_threshold",
      "0", // Disable scene change detection for smoother segments
      "-hls_time",
      "10", // Duration of each HLS segment (in seconds)
      "-hls_list_size",
      "6", // Number of segments to keep in the playlist
      "-hls_flags",
      "delete_segments", // Automatically delete old segments
      "-f",
      "hls", // Output format: HLS
    ])
    .output(path.join(hlsOutputDir, hlsPlaylistName))
    .on("start", (commandLine) => {
      console.log("FFmpeg command: " + commandLine);
    })
    .on("progress", (progress) => {
      console.log(`Processing: ${progress.frames} frames completed`);
    })
    .on("end", () => {
      console.log("Streaming finished!");
      setTimeout(startRTSPtoHLS, 5000); // Restart after 5 seconds
    })
    .on("error", (err) => {
      console.error("Error occurred: " + err.message);
      setTimeout(startRTSPtoHLS, 5000); // Restart after 5 seconds
    })
    .run();
}
