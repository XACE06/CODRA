import type { CodraReply } from "./types";

export interface SubtitleSegment {
  reply_en: string;
  reply_zh: string;
}

const maxEnChars = 92;
const maxZhChars = 46;
const minEnChars = 18;

export function buildSubtitleSegments(reply: CodraReply | null): SubtitleSegment[] {
  if (!reply) return [];

  const englishSentences = splitSentences(reply.reply_en, "en");
  const chineseSentences = splitSentences(reply.reply_zh, "zh");
  const maxLength = Math.max(englishSentences.length, chineseSentences.length, 1);
  const pairs = Array.from({ length: maxLength }, (_, index) => ({
    en: englishSentences[index] ?? "",
    zh: chineseSentences[index] ?? ""
  })).filter((pair) => pair.en || pair.zh);

  const segments = pairs.flatMap((pair) => splitPair(pair.en, pair.zh));
  return mergeTinyEnglishSegments(segments).filter((segment) => segment.reply_en || segment.reply_zh);
}

export function getSubtitleWeights(segments: SubtitleSegment[]) {
  return segments.map((segment) => {
    const words = segment.reply_en.trim().split(/\s+/).filter(Boolean).length;
    const punctuationPauses = (segment.reply_en.match(/[,.!?;:]/g) ?? []).length;
    return Math.max(1.2, words * 0.62 + segment.reply_en.length * 0.012 + punctuationPauses * 0.22 + 0.65);
  });
}

function splitSentences(text: string, language: "en" | "zh") {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const matches = language === "zh"
    ? clean.match(/[^。！？!?]+[。！？!?]?/g)
    : clean.match(/[^.!?]+[.!?]?/g);

  return (matches ?? [clean]).map((part) => part.trim()).filter(Boolean);
}

function splitPair(en: string, zh: string): SubtitleSegment[] {
  const enParts = splitEnglishClause(en);
  const zhParts = splitChineseClause(zh);
  const count = Math.max(enParts.length, zhParts.length, 1);

  return Array.from({ length: count }, (_, index) => ({
    reply_en: enParts[index] ?? "",
    reply_zh: zhParts[index] ?? ""
  }));
}

function splitEnglishClause(text: string) {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= maxEnChars) return [clean];

  const words = clean.split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxEnChars || current.length < minEnChars) {
      current = candidate;
      continue;
    }

    chunks.push(current);
    current = word;
  }

  if (current) chunks.push(current);
  return chunks;
}

function splitChineseClause(text: string) {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= maxZhChars) return [clean];

  const parts = clean.match(/[^，、；;]+[，、；;]?/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";

  for (const part of parts.map((item) => item.trim()).filter(Boolean)) {
    const candidate = `${current}${part}`;
    if (candidate.length <= maxZhChars || current.length < maxZhChars * 0.35) {
      current = candidate;
      continue;
    }

    chunks.push(current);
    current = part;
  }

  if (current) chunks.push(current);
  return chunks.flatMap((chunk) => sliceChineseByLength(chunk));
}

function sliceChineseByLength(text: string) {
  if (text.length <= maxZhChars) return [text];
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += maxZhChars) {
    chunks.push(text.slice(index, index + maxZhChars));
  }
  return chunks;
}

function mergeTinyEnglishSegments(segments: SubtitleSegment[]) {
  const merged: SubtitleSegment[] = [];

  for (const segment of segments) {
    const previous = merged[merged.length - 1];
    const isTinyEnglish = segment.reply_en && segment.reply_en.length < minEnChars;
    const canMergeWithPrevious = previous
      && isTinyEnglish
      && `${previous.reply_en} ${segment.reply_en}`.trim().length <= maxEnChars
      && `${previous.reply_zh}${segment.reply_zh}`.length <= maxZhChars;

    if (canMergeWithPrevious) {
      previous.reply_en = `${previous.reply_en} ${segment.reply_en}`.trim();
      previous.reply_zh = `${previous.reply_zh}${segment.reply_zh}`.trim();
      continue;
    }

    merged.push({ ...segment });
  }

  return merged;
}
