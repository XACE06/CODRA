import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { serverConfig } from "../config";

const execFileAsync = promisify(execFile);
const curlTempDir = path.resolve(process.cwd(), "server/cache/tts");

export async function generateElevenLabsAudio(text: string): Promise<Buffer> {
  debugTts("[tts:elevenlabs] ELEVENLABS_API_KEY loaded:", Boolean(serverConfig.elevenLabsApiKey));
  debugTts("[tts:elevenlabs] voice_id:", serverConfig.elevenLabsVoiceId || "(missing)");

  if (!serverConfig.elevenLabsApiKey || !serverConfig.elevenLabsVoiceId) {
    throw new Error("ElevenLabs API key or Voice ID is not configured.");
  }

  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${serverConfig.elevenLabsVoiceId}`;
  const payload = JSON.stringify({
    text,
    model_id: "eleven_multilingual_v2"
  });

  await fs.mkdir(curlTempDir, { recursive: true });
  const requestId = crypto.createHash("sha256").update(`${text}-${Date.now()}`).digest("hex").slice(0, 16);
  const audioPath = path.join(curlTempDir, `${requestId}.tmp`);
  const headersPath = path.join(curlTempDir, `${requestId}.headers.tmp`);

  try {
    debugTts("[tts:elevenlabs] endpoint:", endpoint);
    const { stdout, stderr } = await execFileAsync("/usr/bin/curl", [
      "-sS",
      "--http1.1",
      "--noproxy",
      "*",
      "-D",
      headersPath,
      "-o",
      audioPath,
      "-w",
      "%{http_code}",
      "-X",
      "POST",
      endpoint,
      "-H",
      "Content-Type: application/json",
      "-H",
      "Accept: audio/mpeg",
      "-H",
      `xi-api-key: ${serverConfig.elevenLabsApiKey}`,
      "-d",
      payload
    ], {
      maxBuffer: 1024 * 1024 * 4,
      env: withoutProxyEnv(process.env)
    });

    const statusCode = Number(stdout.trim());
    const headers = await fs.readFile(headersPath, "utf8").catch(() => "");
    const body = await fs.readFile(audioPath);
    const safeHeaders = sanitizeHeaders(headers);

    debugTts("[tts:elevenlabs] HTTP status:", Number.isFinite(statusCode) ? statusCode : stdout.trim());
    debugTts("[tts:elevenlabs] response headers:\n" + safeHeaders.trim());

    if (!Number.isFinite(statusCode) || statusCode < 200 || statusCode >= 300) {
      const errorText = body.toString("utf8");
      console.error("[tts:elevenlabs] error response body:", errorText || stderr);
      throw new Error(`ElevenLabs request failed with ${stdout.trim() || "unknown"}: ${errorText || stderr}`);
    }

    debugTts("[tts:elevenlabs] audio byte length:", body.byteLength);
    return body;
  } finally {
    await Promise.allSettled([
      fs.unlink(audioPath),
      fs.unlink(headersPath)
    ]);
  }
}

function debugTts(...args: unknown[]) {
  if (serverConfig.ttsDebug) console.info(...args);
}

function withoutProxyEnv(env: NodeJS.ProcessEnv) {
  const cleanEnv = { ...env };
  for (const key of [
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "NO_PROXY",
    "http_proxy",
    "https_proxy",
    "all_proxy",
    "no_proxy"
  ]) {
    delete cleanEnv[key];
  }
  return cleanEnv;
}

function sanitizeHeaders(headers: string) {
  return headers
    .split(/\r?\n/)
    .filter((line) => !/^xi-api-key:/i.test(line))
    .join("\n");
}
