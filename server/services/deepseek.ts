import { serverConfig } from "../config";
import { codraSystemPrompt } from "../prompts/codraSystemPrompt";
import type { CodraEmotion, CodraReply, ConversationTurn } from "../../src/lib/types";
import { buildAppleMusicSearchUrl } from "../../src/lib/appleMusicLink";

const allowedEmotions: CodraEmotion[] = ["calm", "quiet", "warm", "focused", "distant", "tired", "soft"];

export async function getDeepSeekReply(message: string, conversation: ConversationTurn[]): Promise<CodraReply> {
  if (!serverConfig.deepseekApiKey) {
    throw new Error("DeepSeek API key is not configured.");
  }

  const recentConversation = conversation.slice(-(serverConfig.maxContextTurns * 2));
  const latestIntentInstruction = buildLatestIntentInstruction(message, recentConversation);
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverConfig.deepseekApiKey}`
    },
    body: JSON.stringify({
      model: serverConfig.deepseekModel,
      response_format: { type: "json_object" },
      temperature: 0.55,
      max_tokens: 360,
      messages: [
        { role: "system", content: `${codraSystemPrompt}\n\nreply_en must be under ${serverConfig.maxReplyEnChars} characters.` },
        ...recentConversation.map((turn) => ({ role: turn.role, content: turn.content })),
        {
          role: "user",
          content: `Latest user message:\n${message}\n\n${latestIntentInstruction}\n\nReply directly to this latest message. If this is not clearly a music request, music_recommendations must be [].`
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`DeepSeek request failed with ${response.status}: ${errorText.slice(0, 240)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    return fallbackReply();
  }

  return normalizeReply(parseJson(content));
}

function buildLatestIntentInstruction(message: string, recentConversation: ConversationTurn[]) {
  const repeatedUserRequest = recentConversation
    .filter((turn) => turn.role === "user")
    .slice(-2)
    .some((turn) => areSimilarRequests(turn.content, message));

  if (isMoodAdviceRequest(message)) {
    return [
      "The user is asking for ways to feel better, not only sharing a feeling.",
      "Give 2 or 3 gentle, immediately doable suggestions in warm natural sentences.",
      "Do not only ask what happened or why they feel bad.",
      repeatedUserRequest ? "They repeated the request, so do not repeat a question. Answer more directly and practically." : "You may add one soft follow-up question after giving help."
    ].join(" ");
  }

  if (isDirectQuestion(message)) {
    return [
      "The user is asking a direct question.",
      "Answer the question first in Codra's quiet companion voice.",
      "Do not dodge into a follow-up question before answering.",
      repeatedUserRequest ? "The user repeated the question, so be more direct than before." : "You may ask one gentle question only after answering."
    ].join(" ");
  }

  if (repeatedUserRequest) {
    return [
      "The user is repeating or clarifying a previous request.",
      "Do not give the same style of response again.",
      "Adapt to the latest wording and answer more directly."
    ].join(" ");
  }

  return "Respond to the user's actual intent in the latest message.";
}

function isMoodAdviceRequest(message: string) {
  const normalized = message.toLowerCase();
  const asksForAdvice = /方法|办法|怎么办|怎么做|怎么才能|如何|建议|能不能.*(好一点|开心|舒服|缓解)|what should i do|how can i|any way|advice|suggestion/.test(normalized);
  const moodContext = /心情|难过|伤心|失恋|焦虑|压力|累|不好|开心|变好|feel better|mood|sad|upset|anxious|tired/.test(normalized);
  return asksForAdvice && moodContext;
}

function isDirectQuestion(message: string) {
  const normalized = message.toLowerCase();
  return /[?？]|什么|为什么|怎么|如何|能不能|可以吗|是不是|要不要|what|why|how|can you|could you|should i|would you/.test(normalized);
}

function areSimilarRequests(previous: string, current: string) {
  const previousKeywords = extractIntentKeywords(previous);
  const currentKeywords = extractIntentKeywords(current);
  if (!previousKeywords.size || !currentKeywords.size) return false;
  let overlap = 0;
  for (const keyword of currentKeywords) {
    if (previousKeywords.has(keyword)) overlap += 1;
  }
  return overlap >= Math.min(2, currentKeywords.size);
}

function extractIntentKeywords(message: string) {
  const normalized = message.toLowerCase();
  const keywords = [
    "方法", "办法", "怎么办", "怎么", "如何", "建议", "心情", "变好", "开心", "难过",
    "陪", "聊天", "好听", "失恋", "累", "焦虑", "music", "song", "音乐",
    "what", "why", "how", "advice", "suggestion", "feel", "better", "sad", "tired"
  ];
  return new Set(keywords.filter((keyword) => normalized.includes(keyword)));
}

function parseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeReply(value: unknown): CodraReply {
  if (!value || typeof value !== "object") return fallbackReply();
  const record = value as Partial<CodraReply>;
  const replyEn = typeof record.reply_en === "string" && record.reply_en.trim() ? record.reply_en.trim() : fallbackReply().reply_en;
  const replyZh = typeof record.reply_zh === "string" && record.reply_zh.trim() ? record.reply_zh.trim() : fallbackReply().reply_zh;
  const emotion = allowedEmotions.includes(record.emotion as CodraEmotion) ? record.emotion as CodraEmotion : "calm";
  const recommendations = Array.isArray(record.music_recommendations) ? record.music_recommendations.slice(0, 3).map((item) => {
    const title = typeof item?.title === "string" ? item.title : "";
    const artist = typeof item?.artist === "string" ? item.artist : "";
    return {
      title,
      artist,
      reason_en: typeof item?.reason_en === "string" ? item.reason_en : "Quiet and easy to sink into.",
      reason_zh: typeof item?.reason_zh === "string" ? item.reason_zh : "安静，也容易沉进去。",
      apple_music_search_url: typeof item?.apple_music_search_url === "string" && item.apple_music_search_url.startsWith("https://music.apple.com/search")
        ? item.apple_music_search_url
        : buildAppleMusicSearchUrl(title, artist)
    };
  }).filter((item) => item.title && item.artist) : [];

  return {
    reply_en: enforceReplyLength(replyEn),
    reply_zh: replyZh,
    emotion,
    music_recommendations: recommendations
  };
}

function enforceReplyLength(text: string) {
  if (text.length <= serverConfig.maxReplyEnChars) return text;
  return `${text.slice(0, Math.max(0, serverConfig.maxReplyEnChars - 1)).trim()}…`;
}

function fallbackReply(): CodraReply {
  return {
    reply_en: "Something went quiet for a second. Try again.",
    reply_zh: "刚刚有点安静了。再试一次。",
    emotion: "quiet",
    music_recommendations: []
  };
}
