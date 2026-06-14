import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicConfig, serverConfig } from "./config";
import { chatRouter } from "./routes/chat";
import { healthRouter } from "./routes/health";
import { ttsRouter } from "./routes/tts";
import { ensureTtsCacheDir } from "./services/ttsCache";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/api/config", (_req, res) => {
  res.json(getPublicConfig());
});

app.use("/api/health", healthRouter);
app.use("/api/chat", chatRouter);
app.use("/api/tts", ttsRouter);

const distDir = path.resolve(__dirname, "../dist");
app.use(express.static(distDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) res.status(404).send("Codra is not built yet. Run npm run dev or npm run build first.");
  });
});

await ensureTtsCacheDir();

app.listen(serverConfig.port, () => {
  console.log(`Codra API listening on http://127.0.0.1:${serverConfig.port}`);
});
