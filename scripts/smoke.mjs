const API_BASE = process.env.CODRA_API_BASE ?? "http://127.0.0.1:8787";

const checks = [];

async function main() {
  const health = await getJson("/api/health");
  checks.push(["health ok", health.ok === true]);
  checks.push(["chat ready", health.readiness?.chat === true]);
  checks.push(["tts ready", health.readiness?.tts === true]);

  const chatReply = await postJson("/api/chat", {
    message: "Say something short.",
    conversation: []
  });
  checks.push(["chat reply_en", typeof chatReply.reply_en === "string" && chatReply.reply_en.length > 0]);
  checks.push(["chat reply_zh", typeof chatReply.reply_zh === "string" && chatReply.reply_zh.length > 0]);
  checks.push(["non-music chat has no music cards", Array.isArray(chatReply.music_recommendations) && chatReply.music_recommendations.length === 0]);

  const ttsText = `Codra smoke voice test ${Date.now()}.`;
  const firstTts = await postAudio("/api/tts", { text: ttsText });
  checks.push(["tts first status 200", firstTts.status === 200]);
  checks.push(["tts first content type", firstTts.contentType.includes("audio/")]);
  checks.push(["tts first byte length", firstTts.byteLength > 0]);

  const secondTts = await postAudio("/api/tts", { text: ttsText });
  checks.push(["tts repeat status 200", secondTts.status === 200]);
  checks.push(["tts repeat content type", secondTts.contentType.includes("audio/")]);
  checks.push(["tts repeat byte length", secondTts.byteLength > 0]);

  const failed = checks.filter(([, ok]) => !ok);
  for (const [label, ok] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
  }

  console.log("");
  console.log("Smoke summary:", JSON.stringify({
    apiBase: API_BASE,
    mode: health.mode,
    autoTts: health.publicConfig?.autoTts,
    mockChat: health.publicConfig?.useMockChat,
    mockTts: health.publicConfig?.useMockTts,
    firstTtsBytes: firstTts.byteLength,
    secondTtsBytes: secondTts.byteLength
  }, null, 2));

  if (failed.length) {
    process.exitCode = 1;
  }
}

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function postAudio(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const contentType = response.headers.get("content-type") ?? "";
  const byteLength = (await response.arrayBuffer()).byteLength;
  return {
    status: response.status,
    contentType,
    byteLength
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
