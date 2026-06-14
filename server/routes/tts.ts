import { Router } from "express";
import { serverConfig } from "../config";
import { generateElevenLabsAudio } from "../services/elevenlabs";
import { getTtsCachePath, hasCachedTts, writeCachedTts } from "../services/ttsCache";

export const ttsRouter = Router();

ttsRouter.post("/", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  debugTts("[tts:route] request received. text length:", text.length);

  if (!text) {
    return res.status(400).json({ message: "No voice text was provided." });
  }

  if (serverConfig.useMockTts) {
    debugTts("[tts:route] USE_MOCK_TTS=true. Returning mock JSON.");
    return res.json({ mock: true, durationMs: 1800 });
  }

  try {
    if (serverConfig.enableTtsCache && await hasCachedTts(text)) {
      debugTts("[tts:route] cache hit. Returning audio/mpeg from local cache.");
      return res.type("audio/mpeg").sendFile(getTtsCachePath(text));
    }

    const audio = await generateElevenLabsAudio(text);
    debugTts("[tts:route] generated audio byte length:", audio.byteLength);

    if (serverConfig.enableTtsCache) {
      await writeCachedTts(text, audio);
      debugTts("[tts:route] cache write complete. Returning audio/mpeg from cache file.");
      return res.type("audio/mpeg").sendFile(getTtsCachePath(text));
    }

    debugTts("[tts:route] returning audio/mpeg buffer to frontend.");
    return res.type("audio/mpeg").send(audio);
  } catch (error) {
    console.error("[tts]", error);
    return res.status(500).json({
      message: "The voice went quiet. Try again.",
      detail: error instanceof Error ? error.message : "Unknown TTS error."
    });
  }
});

function debugTts(...args: unknown[]) {
  if (serverConfig.ttsDebug) console.info(...args);
}
