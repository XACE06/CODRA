import { Router } from "express";
import { serverConfig } from "../config";
import { getDeepSeekReply } from "../services/deepseek";
import { getMockChatReply } from "../services/mockChat";
import type { CodraReply, ConversationTurn } from "../../src/lib/types";

export const chatRouter = Router();

chatRouter.post("/", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const conversation = Array.isArray(req.body?.conversation)
    ? normalizeConversation(req.body.conversation)
    : [];

  if (!message) {
    return res.status(400).json({ message: "Say something first." });
  }

  try {
    const reply = serverConfig.useMockChat
      ? getMockChatReply(message, serverConfig.maxReplyEnChars)
      : await getDeepSeekReply(message, conversation);

    return res.json(filterMusicForNonMusicRequests(message, reply));
  } catch (error) {
    console.error("[chat]", error);
    return res.status(500).json({
      message: "Something went quiet for a second. Try again.",
      reply_en: "Something went quiet for a second. Try again.",
      reply_zh: "刚刚有点安静了。再试一次。",
      emotion: "quiet",
      music_recommendations: []
    });
  }
});

function filterMusicForNonMusicRequests(message: string, reply: CodraReply): CodraReply {
  if (isMusicRequest(message)) return reply;
  return {
    ...reply,
    music_recommendations: []
  };
}

function isMusicRequest(message: string) {
  const normalized = message.toLowerCase();
  return /music|song|songs|track|tracks|playlist|apple music|音乐|歌曲|歌单|听歌|曲子|歌\b/.test(normalized);
}

function normalizeConversation(value: unknown[]): ConversationTurn[] {
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Partial<ConversationTurn>;
      if (record.role !== "user" && record.role !== "assistant") return null;
      if (typeof record.content !== "string" || !record.content.trim()) return null;
      return {
        role: record.role,
        content: record.content.trim().slice(0, 1200)
      };
    })
    .filter(Boolean)
    .slice(-(serverConfig.maxContextTurns * 2)) as ConversationTurn[];
}
