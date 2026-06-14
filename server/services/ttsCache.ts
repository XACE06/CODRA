import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const cacheDir = path.resolve(process.cwd(), "server/cache/tts");

export function getTtsCachePath(text: string) {
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  return path.join(cacheDir, `${hash}.mp3`);
}

export async function ensureTtsCacheDir() {
  await fs.mkdir(cacheDir, { recursive: true });
}

export async function hasCachedTts(text: string) {
  try {
    await fs.access(getTtsCachePath(text));
    return true;
  } catch {
    return false;
  }
}

export async function writeCachedTts(text: string, audio: Buffer) {
  await ensureTtsCacheDir();
  await fs.writeFile(getTtsCachePath(text), audio);
}
