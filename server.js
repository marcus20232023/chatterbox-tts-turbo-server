import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5432;
const API_TARGET = process.env.API_TARGET || "http://192.168.1.3:4324";
const RICK_VOICE_TARGET =
  process.env.RICK_VOICE_TARGET || API_TARGET;

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/api",
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  })
);

app.use(
  "/api-rick",
  createProxyMiddleware({
    target: RICK_VOICE_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api-rick": "" },
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ChatterTTS Turbo UI running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying API requests to ${API_TARGET}`);
});
