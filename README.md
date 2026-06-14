# Codra Voice AI Interaction Prototype

Codra 是一个移动端优先的 AI 语音对话测试原型，用来验证这条核心链路：

用户输入 → DeepSeek 生成英文回复和中文翻译 → ElevenLabs 使用指定男性 Voice ID 朗读英文回复 → 页面显示中英双语字幕 → 中央 Codra 光团根据状态变化。

`.env.example` 默认处于完全 Mock 开发模式，不会消耗 DeepSeek 或 ElevenLabs 额度。当前实际运行模式以你本地 `.env` 为准。

## 技术栈

- React
- Vite
- TypeScript
- Node.js / Express
- CSS animation
- DeepSeek API
- ElevenLabs API

## 安装依赖

```bash
npm install
```

## 启动开发环境

```bash
npm run dev
```

默认地址：

- 前端：`http://127.0.0.1:5173`
- 后端：`http://127.0.0.1:8787`

Vite 会把 `/api` 请求代理到本地 Express 后端。

如果你只是想直接打开当前项目，可以双击项目根目录里的 `启动Codra.command`。保持它打开，浏览器访问：

```text
http://127.0.0.1:5173
```

如果当前机器暂时没有安装 npm，也可以用项目内的无依赖静态预览先检查视觉与交互草案：

```bash
node scripts/preview-server.mjs
```

预览地址同样是 `http://127.0.0.1:5173`。这个预览用于快速看页面效果；完整 DeepSeek / ElevenLabs 链路请使用 `npm install` 后的正式开发环境。

## 环境变量

复制 `.env.example` 为 `.env`，再按需要修改：

```env
APP_ENV=development
SHOW_DEV_CONTROLS=true

DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat

ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

USE_MOCK_CHAT=true
USE_MOCK_TTS=true
AUTO_TTS=false
ENABLE_TTS_CACHE=true
TTS_DEBUG=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=320
PORT=8787
```

API Key 只在后端读取，不会暴露到前端。前端只能通过 `/api/config` 读取非敏感开关。

项目还提供两份更明确的模板：

- `.env.development.example`：完全 Mock，不消耗 API。
- `.env.production.example`：正式体验，真实 DeepSeek + 真实 ElevenLabs。

你可以用下面的接口检查当前配置是否满足下一阶段：

```bash
curl http://127.0.0.1:8787/api/health
```

这个接口只返回模式、开关和缺失项提醒，不会返回任何 API Key。

也可以跑自动 smoke test，检查当前运行中的 health、chat、TTS 音频返回和缓存复用：

```bash
npm run smoke
```

## DeepSeek 配置

设置：

```env
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-chat
```

当 `USE_MOCK_CHAT=false` 时，后端 `/api/chat` 会调用 DeepSeek。系统提示词单独维护在 `server/prompts/codraSystemPrompt.ts`。

DeepSeek 返回必须被解析成：

```json
{
  "reply_en": "English reply here.",
  "reply_zh": "中文翻译在这里。",
  "emotion": "calm",
  "music_recommendations": []
}
```

后端会兜底处理非 JSON 输出，并限制 `reply_en` 长度。

## ElevenLabs 配置

设置：

```env
ELEVENLABS_API_KEY=你的 ElevenLabs Key
ELEVENLABS_VOICE_ID=你的男性 Voice ID
```

当 `USE_MOCK_TTS=false` 时，后端 `/api/tts` 会调用 ElevenLabs。TTS 只朗读英文 `reply_en`，不会朗读中文翻译。

## Mock 模式

开发默认配置：

```env
APP_ENV=development
SHOW_DEV_CONTROLS=true
USE_MOCK_CHAT=true
USE_MOCK_TTS=true
AUTO_TTS=false
ENABLE_TTS_CACHE=true
TTS_DEBUG=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=320
```

效果：

- 不调用 DeepSeek。
- 不调用 ElevenLabs。
- 页面显示 Dev Controls。
- Dev Controls 是右下角轻量调试标签，不占用主界面布局。
- 点击 `Play Voice` 时使用浏览器 SpeechSynthesis 或模拟 speaking 状态。
- 适合反复调 UI、字幕、光团动画和交互流程。

## 配置健康检查

后端提供：

```text
GET /api/health
```

用途：

- 检查当前是 `development` 还是 `production`。
- 检查 mock chat / mock TTS / auto TTS / TTS cache 是否符合预期。
- 当关闭 mock 但没有配置 Key 时，返回简洁 warnings。
- 不暴露 DeepSeek API Key、ElevenLabs API Key 或 Voice ID。

示例返回：

```json
{
  "ok": true,
  "mode": "development",
  "readiness": {
    "chat": true,
    "tts": true,
    "autoVoice": false,
    "ttsCache": true,
    "contextTurns": 3,
    "replyLimit": 320
  },
  "warnings": []
}
```

## 正式体验模式

```env
APP_ENV=production
SHOW_DEV_CONTROLS=false
USE_MOCK_CHAT=false
USE_MOCK_TTS=false
AUTO_TTS=true
ENABLE_TTS_CACHE=true
TTS_DEBUG=false
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=320
```

效果：

- 真实调用 DeepSeek。
- 真实调用 ElevenLabs。
- Codra 回复后自动播放英文语音。
- 隐藏 Dev Controls。
- 继续保留 TTS 缓存、上下文轮数限制和英文回复长度限制。

## AUTO_TTS

- `AUTO_TTS=false`：DeepSeek 返回后不自动生成语音，页面显示 `Play Voice` 按钮，点击后才调用 `/api/tts`。
- `AUTO_TTS=true`：用户发送消息后，回复生成时自动调用 `/api/tts` 并播放 Codra 英文语音；页面不显示 `Play Voice` 按钮。

开发阶段建议保持 `false`，避免频繁消耗 ElevenLabs 额度。

注意：浏览器通常要求音频播放来自用户手势。项目会在用户点击 Send 时预热音频播放权限，让正式体验里的语音尽量和字幕同步出现；如果浏览器仍然拦截，会显示 `Tap to Play` 作为兜底，不会让页面进入错误状态。

## GitHub 与线上部署

本项目不能只用 GitHub Pages 部署完整体验。GitHub Pages 只能托管静态前端，不能安全运行 `/api/chat`、`/api/tts`，也不能保护 DeepSeek 和 ElevenLabs API Key。

如果只是想让 GitHub Pages 打开一个可看的前端预览，请在仓库 Settings → Pages 中选择：

```text
Branch: main
Folder: /docs
```

`docs/` 中提交的是静态预览构建产物。它会使用 mock 对话和 mock 语音，不会调用 DeepSeek 或 ElevenLabs。

推荐流程：

1. 将源码上传到 GitHub。
2. 在 Render / Railway / Fly.io 这类 Node 托管平台连接 GitHub 仓库。
3. 在托管平台的 Environment Variables 里填写真实 API Key。
4. 使用生产配置运行：

```env
APP_ENV=production
SHOW_DEV_CONTROLS=false
USE_MOCK_CHAT=false
USE_MOCK_TTS=false
AUTO_TTS=true
ENABLE_TTS_CACHE=true
TTS_DEBUG=false
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=320
```

项目根目录已提供 `render.yaml`，在 Render 上创建 Blueprint 或连接仓库时可直接使用：

- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Health Check: `/api/health`

需要在 Render 中手动填写这些敏感变量，不要提交到 GitHub：

```env
DEEPSEEK_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

## TTS 缓存

当 `ENABLE_TTS_CACHE=true` 时：

1. `/api/tts` 根据传入英文文本生成 sha256 hash。
2. 检查 `server/cache/tts/` 是否已有对应 mp3。
3. 有缓存则直接返回，不调用 ElevenLabs。
4. 无缓存才调用 ElevenLabs，并把音频保存到本地。

缓存音频已被 `.gitignore` 忽略。

`TTS_DEBUG=true` 时会输出 ElevenLabs 调用状态、音频大小和缓存命中等调试信息；正式体验建议设为 `false`，失败时仍会保留必要错误信息。

## Apple Music 链接功能

当用户请求音乐时，Codra 可以返回 1–3 首推荐歌曲。页面只展示简洁音乐卡片，并提供 Apple Music 搜索跳转：

```text
https://music.apple.com/search?term=Song%20Name%20Artist
```

本项目不接 Apple Music API，不接 MusicKit，也不在网页内播放 Apple Music。

## 推荐测试流程

### 阶段 1：完全 Mock，不消耗 API

```env
USE_MOCK_CHAT=true
USE_MOCK_TTS=true
AUTO_TTS=false
```

测试页面布局、光团动画、输入框、字幕显示、音乐卡片和状态流转。

### 阶段 2：只测试 DeepSeek，不调用 ElevenLabs

```env
USE_MOCK_CHAT=false
USE_MOCK_TTS=true
AUTO_TTS=false
```

测试 DeepSeek JSON、Codra 英文风格、中文翻译和音乐推荐结构。

### 阶段 3：手动测试 ElevenLabs

```env
USE_MOCK_CHAT=false
USE_MOCK_TTS=false
AUTO_TTS=false
ENABLE_TTS_CACHE=true
```

测试点击 `Play Voice` 后是否调用 ElevenLabs、指定 Voice ID 是否生效、音频是否播放、缓存是否复用。

### 阶段 4：正式自动语音体验

```env
APP_ENV=production
SHOW_DEV_CONTROLS=false
USE_MOCK_CHAT=false
USE_MOCK_TTS=false
AUTO_TTS=true
ENABLE_TTS_CACHE=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=320
```

测试输入后自动生成 Codra 语音、自动播放、光团进入 speaking、开发面板隐藏，同时保留成本保护。

## 已完成功能

- 移动端优先极简 UI。
- Codra 蓝灰色抽象光团。
- `idle` / `listening` / `thinking` / `speaking` / `error` 状态动画。
- 英文主字幕和中文辅助字幕。
- 文字输入对话。
- P1 麦克风输入支持检测和降级提示。
- `/api/chat` DeepSeek 接口。
- `/api/tts` ElevenLabs 接口。
- Mock Chat 和 Mock TTS。
- `AUTO_TTS=false` 时手动 `Play Voice`。
- `AUTO_TTS=true` 时自动播放。
- TTS 本地缓存。
- 最近上下文轮数限制。
- `reply_en` 长度限制。
- 音乐推荐卡片和 Apple Music 搜索跳转。推荐卡片以固定浮层形式出现在左右空白处，不挤压字幕和输入框。
- Dev Controls 仅开发模式显示。
- API Key 后端环境变量管理。

## 后续可扩展方向

- 音频频谱驱动光团动画。
- 更精细的语音输入和取消录音。
- 多轮会话视觉历史。
- 更复杂的 Codra 人格和情绪状态。
- Apple Music API 精准搜索。
- MusicKit 网页内播放。
- 用户长期记忆。
- 抽取成可复用包，迁移到正式项目。
