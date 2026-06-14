import dotenv from "dotenv";

dotenv.config();

const readBoolean = (key: string, fallback: boolean) => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === "true";
};

const readNumber = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : fallback;
};

export const serverConfig = {
  port: readNumber("PORT", 8787),
  appEnv: (process.env.APP_ENV === "production" ? "production" : "development") as "development" | "production",
  showDevControls: readBoolean("SHOW_DEV_CONTROLS", true),
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  deepseekModel: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID ?? "",
  useMockChat: readBoolean("USE_MOCK_CHAT", true),
  useMockTts: readBoolean("USE_MOCK_TTS", true),
  autoTts: readBoolean("AUTO_TTS", false),
  enableTtsCache: readBoolean("ENABLE_TTS_CACHE", true),
  ttsDebug: readBoolean("TTS_DEBUG", process.env.APP_ENV !== "production"),
  maxContextTurns: readNumber("MAX_CONTEXT_TURNS", 3),
  maxReplyEnChars: readNumber("MAX_REPLY_EN_CHARS", 320)
};

export function getPublicConfig() {
  return {
    appEnv: serverConfig.appEnv,
    showDevControls: serverConfig.appEnv === "development" && serverConfig.showDevControls,
    useMockChat: serverConfig.useMockChat,
    useMockTts: serverConfig.useMockTts,
    autoTts: serverConfig.autoTts,
    enableTtsCache: serverConfig.enableTtsCache,
    maxContextTurns: serverConfig.maxContextTurns,
    maxReplyEnChars: serverConfig.maxReplyEnChars
  };
}
