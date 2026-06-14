import type { CodraEmotion, CodraReply, ConversationTurn, MusicRecommendation, PublicConfig } from "./types";

const debugClient = import.meta.env.DEV;
const isGitHubPagesPreview = import.meta.env.PROD && import.meta.env.BASE_URL === "/CODRA/";

export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("Unable to load runtime config.");
    return response.json();
  } catch (error) {
    if (!isGitHubPagesPreview) throw error;

    return {
      appEnv: "development",
      showDevControls: true,
      useMockChat: true,
      useMockTts: true,
      autoTts: false,
      enableTtsCache: true,
      maxContextTurns: 3,
      maxReplyEnChars: 320
    };
  }
}

export async function sendChatMessage(message: string, conversation: ConversationTurn[]): Promise<CodraReply> {
  if (isGitHubPagesPreview) return getStaticPreviewReply(message);

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

function getStaticPreviewReply(message: string): CodraReply {
  const text = message.toLowerCase();
  const asksForMusic = /music|song|playlist|歌|音乐|歌曲|推荐/.test(text);

  if (asksForMusic) {
    return {
      reply_en: "Try these. Keep them low, soft, and close to you for a while.",
      reply_zh: "试试这几首。让它们轻一点、软一点，先陪你待一会儿。",
      emotion: "soft",
      music_recommendations: [
        {
          title: "Show Me How",
          artist: "Men I Trust",
          reason_en: "Soft, slow, and gently detached.",
          reason_zh: "柔软、缓慢，有一点轻轻的疏离感。",
          apple_music_search_url: "https://music.apple.com/search?term=Show%20Me%20How%20Men%20I%20Trust"
        },
        {
          title: "Space Song",
          artist: "Beach House",
          reason_en: "Dreamy, quiet, and easy to sink into.",
          reason_zh: "梦幻、安静，很容易沉进去。",
          apple_music_search_url: "https://music.apple.com/search?term=Space%20Song%20Beach%20House"
        }
      ]
    };
  }

  return {
    reply_en: "I hear you. Stay with me for a second, and tell me the part that feels heaviest.",
    reply_zh: "我听见了。先陪我待一秒，告诉我最压着你的那一部分。",
    emotion: "warm",
    music_recommendations: []
  };
}
