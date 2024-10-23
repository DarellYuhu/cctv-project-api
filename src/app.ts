import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import startRTSPtoHLS from "./cctv-streaming";

const app = new Hono();

startRTSPtoHLS();

app.use(cors({ origin: ["http://localhost:3000", "*"] }));
app.use("/hls-output/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
