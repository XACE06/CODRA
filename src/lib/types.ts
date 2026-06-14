export type CodraStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

export type CodraEmotion = "calm" | "quiet" | "warm" | "focused" | "distant" | "tired" | "soft";

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface MusicRecommendation {
  title: string;
  artist: string;
  reason_en: string;
  reason_zh: string;
  apple_music_search_url: string;
}

export interface CodraReply {
  reply_en: string;
  reply_zh: string;
  emotion: CodraEmotion;
  music_recommendations: MusicRecommendation[];
}

export interface PublicConfig {
  appEnv: "development" | "production";
  showDevControls: boolean;
  useMockChat: boolean;
  useMockTts: boolean;
  autoTts: boolean;
  enableTtsCache: boolean;
  maxContextTurns: number;
  maxReplyEnChars: number;
}
