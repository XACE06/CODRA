import { Router } from "express";
import { getPublicConfig, serverConfig } from "../config";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const realChatReady = serverConfig.useMockChat || Boolean(serverConfig.deepseekApiKey);
  const realTtsReady = serverConfig.useMockTts || Boolean(serverConfig.elevenLabsApiKey && serverConfig.elevenLabsVoiceId);
  const warnings: string[] = [];

  if (!serverConfig.useMockChat && !serverConfig.deepseekApiKey) {
    warnings.push("DEEPSEEK_API_KEY is required when USE_MOCK_CHAT=false.");
  }

  if (!serverConfig.useMockTts && !serverConfig.elevenLabsApiKey) {
    warnings.push("ELEVENLABS_API_KEY is required when USE_MOCK_TTS=false.");
  }

  if (!serverConfig.useMockTts && !serverConfig.elevenLabsVoiceId) {
    warnings.push("ELEVENLABS_VOICE_ID is required when USE_MOCK_TTS=false.");
  }

  if (serverConfig.appEnv === "production" && serverConfig.showDevControls) {
    warnings.push("SHOW_DEV_CONTROLS should be false in production.");
  }

  res.json({
    ok: warnings.length === 0,
    mode: serverConfig.appEnv,
    publicConfig: getPublicConfig(),
    readiness: {
      chat: realChatReady,
      tts: realTtsReady,
      autoVoice: serverConfig.autoTts && realTtsReady,
      ttsCache: serverConfig.enableTtsCache,
      contextTurns: serverConfig.maxContextTurns,
      replyLimit: serverConfig.maxReplyEnChars
    },
    warnings
  });
});
