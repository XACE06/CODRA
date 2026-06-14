import type { CodraReply } from "../../src/lib/types";
import { buildAppleMusicSearchUrl } from "../../src/lib/appleMusicLink";

export function getMockChatReply(message: string, maxReplyChars: number): CodraReply {
  const wantsMusic = /music|song|songs|track|tracks|playlist|apple music|音乐|歌曲|歌单|听歌|曲子|歌\b/.test(message.toLowerCase());

  if (wantsMusic) {
    return trimReply({
      reply_en: "Try these. They feel slow, soft, and a little distant.",
      reply_zh: "试试这几首。它们听起来缓慢、柔软，还有一点疏离感。",
      emotion: "calm",
      music_recommendations: [
        {
          title: "Show Me How",
          artist: "Men I Trust",
          reason_en: "Calm, soft, and slightly detached.",
          reason_zh: "平静、柔软，有一点疏离感。",
          apple_music_search_url: buildAppleMusicSearchUrl("Show Me How", "Men I Trust")
        },
        {
          title: "Space Song",
          artist: "Beach House",
          reason_en: "Wide, quiet, and gently unreal.",
          reason_zh: "宽阔、安静，有一点不真实。",
          apple_music_search_url: buildAppleMusicSearchUrl("Space Song", "Beach House")
        }
      ]
    }, maxReplyChars);
  }

  return trimReply({
    reply_en: "Yeah. I hear you. Let it stay simple for a moment.",
    reply_zh: "嗯，我听到了。先让一切简单一点。",
    emotion: "quiet",
    music_recommendations: []
  }, maxReplyChars);
}

function trimReply(reply: CodraReply, maxReplyChars: number): CodraReply {
  if (reply.reply_en.length <= maxReplyChars) return reply;
  return {
    ...reply,
    reply_en: `${reply.reply_en.slice(0, Math.max(0, maxReplyChars - 1)).trim()}…`
  };
}
