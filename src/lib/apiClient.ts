import type { CodraEmotion, CodraReply, ConversationTurn, MusicRecommendation, PublicConfig } from "./types";

const debugClient = import.meta.env.DEV;

export async function getPublicConfig(): Promise<PublicConfig> {
  const response = await fetch("/api/config");
  if (!response.ok) throw new Error("Unable to load runtime config.");
  return response.json();
}

export async function sendChatMessage(message: string, conversation: ConversationTurn[]): Promise<CodraReply> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversation })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Chat request failed.");
  }

  return normalizeReply(await response.json());
}

export async function requestTtsAudio(text: string): Promise<Blob | null> {
  debugLog("[tts:client] sending /api/tts request. text length:", text.length);
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const contentType = response.headers.get("content-type") ?? "";
  debugLog("[tts:client] response status:", response.status);
  debugLog("[tts:client] response Content-Type:", contentType || "(missing)");

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.error("[tts:client] error response:", error);
    throw new Error(error?.detail ?? error?.message ?? "Voice request failed.");
  }

  if (contentType.includes("application/json")) {
    debugLog("[tts:client] received JSON mock response.");
    return null;
  }

  const blob = await response.blob();
  debugLog("[tts:client] audio blob size:", blob.size);
  debugLog("[tts:client] audio blob type:", blob.type || "(missing)");
  return blob;
}

const allowedEmotions: CodraEmotion[] = ["calm", "quiet", "warm", "focused", "distant", "tired", "soft"];

function normalizeReply(value: unknown): CodraReply {
  const fallback: CodraReply = {
    reply_en: "Something went quiet for a second. Try again.",
    reply_zh: "刚刚有点安静了。再试一次。",
    emotion: "quiet",
    music_recommendations: []
  };

  if (!value || typeof value !== "object") return fallback;
  const record = value as Partial<CodraReply>;
  const replyEn = typeof record.reply_en === "string" && record.reply_en.trim()
    ? record.reply_en.trim()
    : fallback.reply_en;
  const replyZh = typeof record.reply_zh === "string" && record.reply_zh.trim()
    ? record.reply_zh.trim()
    : fallback.reply_zh;
  const emotion = allowedEmotions.includes(record.emotion as CodraEmotion)
    ? record.emotion as CodraEmotion
    : "calm";
  const recommendations = Array.isArray(record.music_recommendations)
    ? record.music_recommendations.map(normalizeRecommendation).filter(Boolean) as MusicRecommendation[]
    : [];

  return {
    reply_en: replyEn,
    reply_zh: replyZh,
    emotion,
    music_recommendations: recommendations.slice(0, 3)
  };
}

function normalizeRecommendation(value: unknown): MusicRecommendation | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<MusicRecommendation>;
  if (!record.title || !record.artist) return null;

  const title = String(record.title).trim();
  const artist = String(record.artist).trim();
  const appleMusicUrl = typeof record.apple_music_search_url === "string" && record.apple_music_search_url.startsWith("https://music.apple.com/search")
    ? record.apple_music_search_url
    : `https://music.apple.com/search?term=${encodeURIComponent(`${title} ${artist}`)}`;

  return {
    title,
    artist,
    reason_en: typeof record.reason_en === "string" ? record.reason_en : "Quiet and easy to sink into.",
    reason_zh: typeof record.reason_zh === "string" ? record.reason_zh : "安静，也容易沉进去。",
    apple_music_search_url: appleMusicUrl
  };
}

function debugLog(...args: unknown[]) {
  if (debugClient) console.info(...args);
}
