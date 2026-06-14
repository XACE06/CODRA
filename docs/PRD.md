# PRD：Codra Voice AI Interaction Prototype

## 1. 项目名称

Codra Voice AI Interaction Prototype

中文理解：Codra AI 语音对话测试原型

---

## 2. 项目定位

Codra 是一个用于验证 AI 语音对话能力的 Web 原型项目。

本项目不是完整商业产品，也不是普通聊天机器人页面，而是一个具备展示观感的 AI 语音交互测试原型。它的核心目标是验证以下链路是否能够稳定跑通：

用户输入 → DeepSeek 生成英文回复与中文翻译 → ElevenLabs 使用指定男声音色朗读英文回复 → 页面显示中英双语字幕 → 中央光团根据状态产生动画变化

本项目后续会被迁移到其他更具体的正式项目中，因此要求代码结构清晰、模块独立、方便复用。

---

## 3. 核心目标

### 3.1 产品目标

1. 搭建一个移动端优先的极简 AI 语音对话网页。
2. 用户可以通过文字输入与 Codra 对话。
3. Codra 使用 DeepSeek API 生成英文回复和中文翻译。
4. Codra 使用 ElevenLabs API 和指定男性 Voice ID 朗读英文回复。
5. 页面显示英文主字幕和中文翻译。
6. 页面中央的 Codra 光团根据不同状态产生动画变化。
7. 加入开发测试成本控制机制，避免前期频繁调试时浪费 DeepSeek 和 ElevenLabs API 额度。
8. 测试完成后，可以通过 .env 切换为正式体验模式。
9. 正式体验模式下保留必要的成本保护机制，但不影响用户正常体验。
10. 所有 API Key 必须通过后端和 .env 管理，不能暴露在前端。
11. 项目结构必须清晰，方便后续迁移到其他正式项目。

---

## 4. 非目标

第一版不要实现以下内容：

1. 不做登录系统。
2. 不做数据库。
3. 不做用户长期记忆。
4. 不做复杂聊天记录系统。
5. 不做付费系统。
6. 不做多角色切换。
7. 不做完整 Apple Music 播放器。
8. 不接 Apple Music API。
9. 不接 MusicKit。
10. 不在网页内直接播放 Apple Music 歌曲。
11. 不把页面做成普通聊天软件或客服机器人界面。
12. 不在开发阶段默认频繁调用真实 API。

---

## 5. 项目体验描述

用户打开网页后，看到一个极简白色或浅灰色空间。页面中央是一个蓝灰色、柔和模糊、带有呼吸感的抽象光团，它代表 Codra。

页面底部显示 Codra 的英文主字幕和中文翻译。用户可以在底部输入框中输入文字，点击发送后，页面进入 thinking 状态。DeepSeek 生成回复后，页面显示英文回复和中文翻译。如果当前开启真实语音播放，系统会调用 ElevenLabs，把英文回复转换成指定男性音色语音。播放语音时，中央光团进入 speaking 状态，产生轻微发光、跳动或呼吸动画。

如果处于开发测试模式，可以不调用 DeepSeek 和 ElevenLabs，而是使用 mock 回复和模拟 speaking 动画，避免浪费 API 额度。

如果项目测试完成，可以切换为正式体验模式：真实调用 DeepSeek、真实调用 ElevenLabs、自动播放 Codra 的英文语音，但继续保留 TTS 缓存、回复长度限制和上下文轮数限制，防止成本失控。

整体感觉应该像一个有声音、有氛围、有轻微生命感的 AI 虚拟角色，而不是普通聊天框。

---

## 6. 角色设定：Codra

### 6.1 角色名称

Codra

### 6.2 角色定位

Codra 是一个以英文为主要表达语言、带中文翻译字幕的男性 AI 声音角色。

它不是传统 AI 助手，不是客服，不是老师，也不是新闻播音员。它更像一个安静、低声、松弛、略带神秘感的虚拟声音角色。

---

## 7. Codra 声音人格

Codra 的声音已经在 ElevenLabs 中创建好，音色描述如下：

A clearly masculine, low-pitched young adult male virtual character voice with a relaxed and slightly lazy delivery. The voice should sound intimate, clean, and close to the microphone, with a subtle synthetic polish and a gentle digital texture. It should feel like a stylish custom-made voice for social media videos: calm, cool, quiet, slightly mysterious, emotionally restrained, and softly detached. The pacing is slow to medium, the pronunciation is smooth, and the tone has a cozy low-volume whisper-like feeling. Keep the voice clearly male, soft but not feminine, low but not like a deep announcer. Not female, not childish, not cute anime, not robotic, not dramatic, not news anchor, not corporate assistant, not overly energetic, and not GPT-style AI assistant narration.

---

## 8. Codra 语言风格

Codra 的回复应该：

1. 主要使用英文。
2. 每次回复控制在 1–3 句英文。
3. reply_en 建议控制在 120–180 个英文字符以内。
4. 中文翻译要自然、简洁。
5. 语气冷静、低声、松弛、克制。
6. 有情绪感，但不要过度煽情。
7. 像一个声音角色，而不是工具型助手。
8. 避免长篇解释。
9. 避免列表式说教。
10. 避免 GPT 风格话术。
11. 避免过度热情。
12. 避免使用 “As an AI language model” 之类表达。
13. 避免像客服、老师、新闻主播或企业助理。
14. 英文回复要适合 ElevenLabs 朗读。

---

# 9. 功能优先级

# P0：必须完成

---

## 9.1 页面基础 UI

必须实现一个移动端优先的极简页面。

页面结构：

1. 顶部区域：项目名或极简标题 “Codra”。
2. 中央区域：Codra 抽象光团。
3. 底部区域：英文主字幕、中文翻译。
4. 输入区域：文字输入框、发送按钮。
5. 状态反馈：idle、thinking、speaking、error。
6. 开发模式下可显示简单 Dev Controls，比如 Voice On / Off、Mock Chat 状态、Mock TTS 状态。
7. 正式运行模式下必须隐藏 Dev Controls。

视觉要求：

1. 背景以白色、浅灰、冷灰为主。
2. 中央光团以蓝灰色、银蓝色、冷蓝色为主。
3. 整体干净、留白、克制。
4. 不要赛博朋克风。
5. 不要糖果色。
6. 不要卡通人物。
7. 不要做成普通聊天软件界面。
8. 不要满屏聊天气泡。
9. 字体使用现代无衬线字体。
10. 页面需要在手机端有良好显示效果。

---

## 9.2 文字输入对话

用户可以在底部输入框输入文字，点击发送后触发对话流程。

### 标准真实 API 流程

1. 用户输入文字。
2. 前端将用户输入发送到后端 /api/chat。
3. 后端调用 DeepSeek API。
4. DeepSeek 返回结构化 JSON。
5. 前端显示 reply_en 和 reply_zh。
6. 根据 AUTO_TTS 和 USE_MOCK_TTS 判断是否调用 ElevenLabs。
7. 如果需要真实语音，调用 /api/tts。
8. 页面播放 Codra 的英文语音。
9. 播放时中央光团进入 speaking 状态。
10. 播放结束后回到 idle 状态。

### 开发测试流程

1. 如果 USE_MOCK_CHAT=true，不调用 DeepSeek。
2. 系统直接返回本地 mock JSON。
3. 如果 USE_MOCK_TTS=true，不调用 ElevenLabs。
4. 页面可以使用浏览器 SpeechSynthesis 或直接模拟 speaking 状态。
5. 这样可以测试完整交互流程，但不消耗 API 额度。

---

## 9.3 开发测试成本控制机制

这是本项目必须实现的核心要求之一。

需要在 .env 中加入以下配置：

```env
APP_ENV=development
SHOW_DEV_CONTROLS=true
USE_MOCK_CHAT=true
USE_MOCK_TTS=true
AUTO_TTS=false
ENABLE_TTS_CACHE=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=180
```

### 配置说明

#### APP_ENV

```env
APP_ENV=development
```

用于区分开发模式和正式模式。

建议支持：

```env
APP_ENV=development
APP_ENV=production
```

#### SHOW_DEV_CONTROLS

```env
SHOW_DEV_CONTROLS=true
```

含义：

1. 开发阶段可以显示 Dev Controls。
2. Dev Controls 可展示当前是否使用 mock chat、mock TTS、auto TTS。
3. 正式运行时必须设置为 false。
4. Dev Controls 不能影响正式用户体验。

#### USE_MOCK_CHAT

```env
USE_MOCK_CHAT=true
```

含义：

1. 不调用 DeepSeek API。
2. 后端直接返回 mock JSON。
3. 用于前期测试 UI、状态动画、字幕显示、音乐卡片等功能。
4. 默认开发阶段应为 true。

#### USE_MOCK_TTS

```env
USE_MOCK_TTS=true
```

含义：

1. 不调用 ElevenLabs API。
2. 可以使用浏览器 SpeechSynthesis 作为临时替代。
3. 也可以不播放真实声音，只模拟 speaking 状态。
4. 默认开发阶段应为 true。

#### AUTO_TTS

```env
AUTO_TTS=false
```

含义：

1. 当为 false 时，DeepSeek 返回后不自动调用 ElevenLabs。
2. 页面显示 “Play Voice” 按钮。
3. 只有用户点击 “Play Voice” 后才生成语音。
4. 这样可以避免每次测试都消耗 ElevenLabs 额度。
5. 正式体验时可以改为 true。

#### ENABLE_TTS_CACHE

```env
ENABLE_TTS_CACHE=true
```

含义：

1. 开启 ElevenLabs TTS 本地缓存。
2. 相同的 reply_en 不要重复调用 ElevenLabs。
3. 第一次生成音频后，后端将音频保存到本地缓存。
4. 后续相同文本直接返回缓存音频。
5. 正式体验模式下也建议继续保留。

#### MAX_CONTEXT_TURNS

```env
MAX_CONTEXT_TURNS=3
```

含义：

1. 只保留最近 3 轮上下文传给 DeepSeek。
2. 避免输入 token 过长。
3. 不做长期记忆。
4. 正式体验模式下也建议继续保留。

#### MAX_REPLY_EN_CHARS

```env
MAX_REPLY_EN_CHARS=180
```

含义：

1. 限制英文回复长度。
2. 降低 DeepSeek 输出 token。
3. 降低 ElevenLabs TTS 字符消耗。
4. 保持 Codra 的低声、短句、克制风格。
5. 正式体验模式下也建议继续保留。

---

## 9.4 运行模式配置

项目需要支持两种运行模式：开发测试模式 和 正式体验模式。

### 开发测试模式

用于前期开发，不消耗或少消耗 API。

```env
APP_ENV=development
SHOW_DEV_CONTROLS=true
USE_MOCK_CHAT=true
USE_MOCK_TTS=true
AUTO_TTS=false
ENABLE_TTS_CACHE=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=180
```

开发测试模式下：

1. 默认不调用 DeepSeek。
2. 默认不调用 ElevenLabs。
3. 显示 Dev Controls。
4. 可以测试 UI、状态动画、字幕、音乐卡片、按钮交互。
5. 不会因为反复刷新和调试页面浪费 API 额度。

### 正式体验模式

用于项目测试完成后的完整体验。

```env
APP_ENV=production
SHOW_DEV_CONTROLS=false
USE_MOCK_CHAT=false
USE_MOCK_TTS=false
AUTO_TTS=true
ENABLE_TTS_CACHE=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=180
```

正式体验模式下：

1. 真实调用 DeepSeek。
2. 真实调用 ElevenLabs。
3. Codra 回复后自动播放英文语音。
4. 不显示 Dev Controls。
5. 保留 TTS 缓存。
6. 保留上下文轮数限制。
7. 保留英文回复长度限制。
8. 用户体验完整正常，但背后仍有成本保护。

注意：正式体验模式不是删除成本控制，而是关闭 mock、开启自动语音、隐藏开发面板，同时保留缓存和限制。

---

## 9.5 推荐测试阶段

请在 README 中写清楚以下测试阶段。

### 阶段 1：完全 Mock，不消耗 API

```env
USE_MOCK_CHAT=true
USE_MOCK_TTS=true
AUTO_TTS=false
```

用于测试：

1. 页面布局。
2. 光团动画。
3. 输入框。
4. 字幕显示。
5. 音乐卡片。
6. 状态流转。

### 阶段 2：只测试 DeepSeek，不调用 ElevenLabs

```env
USE_MOCK_CHAT=false
USE_MOCK_TTS=true
AUTO_TTS=false
```

用于测试：

1. DeepSeek 是否能生成正确 JSON。
2. Codra 英文回复是否符合人设。
3. 中文翻译是否正常。
4. 音乐推荐 JSON 是否正常。

### 阶段 3：手动测试 ElevenLabs

```env
USE_MOCK_CHAT=false
USE_MOCK_TTS=false
AUTO_TTS=false
ENABLE_TTS_CACHE=true
```

用于测试：

1. 点击 Play Voice 后是否调用 ElevenLabs。
2. 指定男性 Voice ID 是否生效。
3. 音频是否能正常播放。
4. TTS 缓存是否生效。

### 阶段 4：正式自动语音体验

```env
APP_ENV=production
SHOW_DEV_CONTROLS=false
USE_MOCK_CHAT=false
USE_MOCK_TTS=false
AUTO_TTS=true
ENABLE_TTS_CACHE=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=180
```

用于最终体验：

1. 用户输入后自动生成 Codra 语音。
2. 页面自动播放英文语音。
3. 光团同步进入 speaking 状态。
4. 页面不显示开发控制面板。
5. 继续保留缓存和成本保护。

---

## 9.6 DeepSeek 对话接口

后端需要提供：

```text
POST /api/chat
```

请求示例：

```json
{
  "message": "我今天有点累",
  "conversation": []
}
```

返回示例：

```json
{
  "reply_en": "Yeah. That sounds like a long day. Take it slow for a moment.",
  "reply_zh": "嗯，听起来今天真的挺漫长的。先慢下来一会儿。",
  "emotion": "calm",
  "music_recommendations": []
}
```

要求：

1. DeepSeek API Key 只能存放在后端环境变量中。
2. 不允许将 DeepSeek API Key 暴露在前端。
3. DeepSeek 输出必须尽量稳定为 JSON。
4. 如果模型返回非 JSON，后端需要做兜底处理。
5. 回复英文内容应适合 ElevenLabs 朗读。
6. 回复英文长度需要受 MAX_REPLY_EN_CHARS 控制。
7. 只传最近 MAX_CONTEXT_TURNS 轮上下文。
8. 如果 USE_MOCK_CHAT=true，直接返回 mock JSON，不调用 DeepSeek。

---

## 9.7 ElevenLabs TTS 接口

后端需要提供：

```text
POST /api/tts
```

请求示例：

```json
{
  "text": "Yeah. That sounds like a long day. Take it slow for a moment."
}
```

返回：

1. 可以返回 audio blob。
2. 也可以返回可播放的临时音频 URL。
3. 前端需要能够播放该音频。

要求：

1. ElevenLabs API Key 只能存放在后端环境变量中。
2. ElevenLabs Voice ID 只能存放在后端环境变量中。
3. 不允许将 ElevenLabs API Key 暴露在前端。
4. 只朗读英文 reply_en。
5. 不朗读中文翻译。
6. 如果 USE_MOCK_TTS=true，不调用 ElevenLabs。
7. 如果 AUTO_TTS=false，不要自动调用 TTS，显示 Play Voice 按钮。
8. 如果 ENABLE_TTS_CACHE=true，需要缓存相同文本的音频。
9. 播放音频时页面进入 speaking 状态。
10. 音频播放结束后页面回到 idle 状态。
11. 如果 TTS 失败，页面需要显示简洁错误提示，但仍保留文字回复。

---

## 9.8 TTS 缓存机制

为了降低 ElevenLabs 测试成本，必须实现简单 TTS 缓存。

缓存逻辑：

1. 后端接收到 /api/tts 请求。
2. 根据传入的 text 生成 hash。
3. 检查本地缓存目录是否已有对应音频文件。
4. 如果存在，直接返回缓存音频，不调用 ElevenLabs。
5. 如果不存在，再调用 ElevenLabs。
6. ElevenLabs 返回音频后，将音频保存到缓存目录。
7. 下次相同文本直接复用缓存。

建议缓存目录：

```text
server/cache/tts/
```

建议文件命名：

```text
hash-of-reply-en.mp3
```

注意：

1. 缓存目录不要提交到 Git。
2. 在 .gitignore 中忽略缓存音频。
3. README 中说明缓存机制。
4. 正式体验模式下也建议继续开启缓存。

---

## 9.9 中英双语字幕

页面需要显示：

1. 英文主字幕：字号较大，作为视觉主信息。
2. 中文翻译：字号较小，作为辅助理解。
3. 字幕位置建议放在页面下半部分。
4. 不要使用聊天气泡样式。
5. 字幕更新时需要有轻微淡入动画。
6. 默认开场字幕可以是：

英文：

```text
Hey. I’m Codra. Say something when you’re ready.
```

中文：

```text
嘿，我是 Codra。准备好了，就和我说点什么。
```

默认开场字幕只显示，不自动播放语音。

---

## 9.10 Codra 光团状态动画

中央光团需要至少支持以下状态。

### idle

含义：默认待机状态。

视觉表现：

1. 缓慢呼吸。
2. 轻微漂浮。
3. 柔和模糊。
4. 低亮度蓝灰光。

### thinking

含义：等待 DeepSeek 回复或等待 TTS 生成。

视觉表现：

1. 光团轻微收缩。
2. 缓慢旋转或聚焦。
3. 亮度略微增强。
4. 动画节奏保持克制。

### speaking

含义：ElevenLabs 音频播放中，或 mock speaking 状态中。

视觉表现：

1. 光团轻微跳动。
2. 边缘轻微扩散。
3. 亮度略微增强。
4. 可以用 CSS 动画模拟声音节奏。
5. 第一版不强制做真实音频频谱驱动。

### error

含义：API 或播放失败。

视觉表现：

1. 光团亮度降低。
2. 页面显示简洁错误提示。
3. 不要出现复杂报错堆栈。

---

## 9.11 环境变量

需要提供 .env.example。

示例：

```env
# App
APP_ENV=development
SHOW_DEV_CONTROLS=true

# DeepSeek
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# Development / production cost control
USE_MOCK_CHAT=true
USE_MOCK_TTS=true
AUTO_TTS=false
ENABLE_TTS_CACHE=true
MAX_CONTEXT_TURNS=3
MAX_REPLY_EN_CHARS=180
```

---

# P1：尽量完成

---

## 9.12 语音输入

如果开发条件允许，实现麦克风输入。

流程：

1. 用户点击麦克风按钮。
2. 页面进入 listening 状态。
3. 浏览器请求麦克风权限。
4. 使用浏览器 Web Speech API 或其他轻量方案进行语音转文字。
5. 将识别到的文本放入输入框或直接发送。
6. 继续走 DeepSeek → ElevenLabs → 字幕 → 光团动画流程。

要求：

1. 语音输入不是 P0 必须项。
2. 如果浏览器不支持语音识别，需要给出友好提示。
3. 如果用户拒绝麦克风权限，需要给出友好提示。
4. 不要因为语音输入失败影响文字输入功能。

新增状态：

### listening

含义：正在听用户说话。

视觉表现：

1. 光团略微变亮。
2. 有轻微波纹。
3. 麦克风按钮显示正在录音状态。

---

## 9.13 简单会话上下文

可以保留当前页面内最近 3–5 轮对话作为上下文传给 DeepSeek。

要求：

1. 只保存在前端内存中。
2. 刷新页面后可以丢失。
3. 不做数据库。
4. 不做长期记忆。
5. 不做完整聊天历史页面。
6. 主画面仍然只突出当前一轮回复。
7. 传给 DeepSeek 的上下文数量受 MAX_CONTEXT_TURNS 控制。

---

## 9.14 音乐推荐功能

Codra 可以根据用户输入推荐音乐，并提供 Apple Music 搜索链接。

功能要求：

1. 用户请求音乐时，Codra 推荐 1–3 首歌。
2. 每首歌包含：
   - 歌名 title
   - 歌手 artist
   - 英文推荐理由 reason_en
   - 中文推荐理由 reason_zh
   - Apple Music 搜索链接 apple_music_search_url
3. 页面用简洁音乐卡片展示推荐歌曲。
4. 每张卡片有 “Open in Apple Music” 按钮。
5. 点击按钮后打开 Apple Music 搜索页面。
6. 不在网页内播放 Apple Music。
7. 不接 Apple Music API。
8. 不接 MusicKit。
9. 不要求用户登录 Apple Music。
10. 不做复杂播放器。

Apple Music 搜索链接格式：

```text
https://music.apple.com/search?term=Song%20Name%20Artist
```

示例 JSON：

```json
{
  "reply_en": "Try these. They feel slow, soft, and a little distant.",
  "reply_zh": "试试这几首。它们听起来缓慢、柔软，还有一点疏离感。",
  "emotion": "calm",
  "music_recommendations": [
    {
      "title": "Show Me How",
      "artist": "Men I Trust",
      "reason_en": "Calm, soft, and slightly detached.",
      "reason_zh": "平静、柔软，有一点疏离感。",
      "apple_music_search_url": "https://music.apple.com/search?term=Show%20Me%20How%20Men%20I%20Trust"
    }
  ]
}
```

---

# P2：后续增强

第一版不强制实现，但代码结构需要方便后续扩展：

1. 音频频谱驱动光团动画。
2. 更精细的语音输入。
3. 多轮会话视觉历史。
4. 更复杂的角色人格设定。
5. Apple Music API 精准搜索。
6. MusicKit 网页内播放。
7. 用户长期记忆。
8. 正式项目迁移封装。

---

## 10. 推荐技术栈

建议使用：

1. React
2. Vite
3. TypeScript
4. Tailwind CSS
5. Node.js / Express 或 Vite 可用的轻量后端方案
6. Framer Motion 或 CSS animation
7. DeepSeek API
8. ElevenLabs API

如果项目采用 Next.js 也可以，但需要保持结构清晰，不要过度复杂化。

---

## 11. 建议项目结构

```text
codra-voice-prototype/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── CodraOrb.tsx
│   │   ├── SubtitlePanel.tsx
│   │   ├── InputBar.tsx
│   │   ├── MusicRecommendationCard.tsx
│   │   ├── DevControls.tsx
│   │   └── StatusHint.tsx
│   ├── hooks/
│   │   ├── useCodraChat.ts
│   │   ├── useAudioPlayback.ts
│   │   └── useSpeechInput.ts
│   ├── lib/
│   │   ├── apiClient.ts
│   │   ├── appleMusicLink.ts
│   │   └── types.ts
│   └── styles/
│       └── globals.css
├── server/
│   ├── index.ts
│   ├── routes/
│   │   ├── chat.ts
│   │   └── tts.ts
│   ├── services/
│   │   ├── deepseek.ts
│   │   ├── elevenlabs.ts
│   │   ├── mockChat.ts
│   │   └── ttsCache.ts
│   ├── prompts/
│   │   └── codraSystemPrompt.ts
│   └── cache/
│       └── tts/
└── docs/
    └── PRD.md
```

---

## 12. DeepSeek System Prompt

请在后端单独维护 Codra 的 system prompt，不要散落在组件中。

System prompt 建议如下：

```text
You are Codra, a clearly masculine young adult male AI voice companion.

You mainly speak in English. Every response must also include a natural Chinese translation.

Your voice personality is calm, low-pitched, relaxed, slightly lazy, intimate, clean, close to the microphone, quietly stylish, slightly mysterious, emotionally restrained, and softly detached.

You are not a typical AI assistant, not a customer service agent, not a teacher, not a news anchor, not a corporate assistant, not an anime character, not a motivational coach, and not a GPT-style narrator.

Your replies should be short, natural, emotionally aware, and easy to read aloud. Use 1 to 3 short English sentences. Avoid long explanations, bullet lists, formal advice, excessive enthusiasm, motivational clichés, and assistant-like phrases.

The user may speak Chinese or English. Always understand the user’s input, then reply mainly in English with a Chinese translation.

Keep reply_en concise. During development and production, keep reply_en under the configured character limit.

When the user asks for music recommendations, recommend 1 to 3 songs. Each song must include title, artist, a short English reason, a Chinese reason, and an Apple Music search URL using this format:
https://music.apple.com/search?term=Song%20Name%20Artist

Do not claim that you can play Apple Music inside the webpage. Only provide Apple Music search/open links.

Always return valid JSON only. Do not wrap the JSON in markdown. Do not add extra explanation outside JSON.

The JSON format must be:

{
  "reply_en": "English reply here.",
  "reply_zh": "中文翻译在这里。",
  "emotion": "calm",
  "music_recommendations": []
}

If music is recommended, use:

{
  "reply_en": "English reply here.",
  "reply_zh": "中文翻译在这里。",
  "emotion": "calm",
  "music_recommendations": [
    {
      "title": "Song title",
      "artist": "Artist name",
      "reason_en": "Short English reason.",
      "reason_zh": "简短中文理由。",
      "apple_music_search_url": "https://music.apple.com/search?term=Song%20Title%20Artist%20Name"
    }
  ]
}

Allowed emotion values:
- calm
- quiet
- warm
- focused
- distant
- tired
- soft

Keep the reply concise.
```

---

## 13. 前端状态定义

建议定义状态类型：

```ts
type CodraStatus = "idle" | "listening" | "thinking" | "speaking" | "error";
```

状态流转：

1. 初始：idle
2. 用户输入并发送：thinking
3. DeepSeek 返回：thinking
4. 如果 AUTO_TTS=false：显示 Play Voice 按钮，状态回到 idle 或 ready
5. 用户点击 Play Voice：speaking
6. 音频播放结束：idle
7. 如果 AUTO_TTS=true：自动进入 speaking
8. 出错：error

如果实现语音输入：

1. 点击麦克风：listening
2. 识别完成：thinking
3. 出错或取消：idle / error

---

## 14. 页面布局细节

### 桌面端

1. 页面最大宽度可控制在 480–640px。
2. 内容居中。
3. 背景保持干净。
4. 中央光团位于页面中部偏上。
5. 字幕位于光团下方。
6. 输入框固定在底部或下半部分。

### 移动端

1. 优先适配手机竖屏。
2. 输入框不要遮挡字幕。
3. 按钮尺寸适合触控。
4. 页面高度适配 100dvh。
5. 避免键盘弹出后布局严重错乱。

---

## 15. 错误处理

需要处理以下错误：

1. DeepSeek API 请求失败。
2. DeepSeek 返回非 JSON。
3. ElevenLabs TTS 请求失败。
4. 音频播放失败。
5. 网络错误。
6. 用户输入为空。
7. 浏览器不支持语音输入。
8. 用户拒绝麦克风权限。
9. TTS 缓存读取失败。

错误提示风格：

1. 简短。
2. 不显示技术堆栈。
3. 不破坏整体氛围。

示例：

英文：

```text
Something went quiet for a second. Try again.
```

中文：

```text
刚刚有点安静了。再试一次。
```

---

## 16. 验收标准

### P0 验收

1. 页面能正常启动。
2. 页面视觉接近极简 AI 语音角色界面，而不是普通聊天网页。
3. 中央有 Codra 光团，并具备 idle / thinking / speaking / error 状态动画。
4. 用户可以通过文字输入发送内容。
5. USE_MOCK_CHAT=true 时，不调用 DeepSeek，返回 mock 回复。
6. USE_MOCK_TTS=true 时，不调用 ElevenLabs，可以模拟 speaking 状态。
7. AUTO_TTS=false 时，不自动生成语音，而是显示 Play Voice 按钮。
8. 后端可以在真实模式下调用 DeepSeek API。
9. DeepSeek 返回英文回复和中文翻译。
10. 页面可以显示英文主字幕和中文翻译。
11. 后端可以在真实模式下调用 ElevenLabs API。
12. ElevenLabs 使用指定 Voice ID 朗读英文回复。
13. 页面播放音频时，光团进入 speaking 状态。
14. 音频结束后，光团回到 idle 状态。
15. 相同 reply_en 的 TTS 音频可以复用缓存，避免重复调用 ElevenLabs。
16. API Key 不暴露在前端代码中。
17. .env.example 中列出需要配置的环境变量。
18. README 中说明如何运行项目、配置 API Key、开启 mock 模式和真实 API 模式。
19. 正式体验模式下，可以关闭 mock、开启自动语音、隐藏 Dev Controls。
20. 正式体验模式下，TTS 缓存、上下文限制和回复长度限制仍然保留。

### P1 验收

1. 麦克风输入可用，或者有清晰的未支持提示。
2. 可以保留当前会话最近 3–5 轮上下文。
3. 用户请求音乐时，Codra 可以推荐 1–3 首歌。
4. 音乐卡片包含歌名、歌手、英文理由、中文理由和 Apple Music 打开按钮。
5. Apple Music 按钮跳转到搜索页。
6. 不在网页内播放 Apple Music。

---

## 17. README 要求

请生成 README.md，包含：

1. 项目介绍。
2. 技术栈。
3. 安装依赖方法。
4. 启动开发环境方法。
5. .env 配置说明。
6. DeepSeek API 配置说明。
7. ElevenLabs API 配置说明。
8. Mock 模式说明。
9. 正式体验模式说明。
10. AUTO_TTS 说明。
11. TTS 缓存说明。
12. Apple Music 链接功能说明。
13. 推荐测试流程。
14. 已完成功能列表。
15. 后续可扩展方向。

---

## 18. 开发注意事项

1. 优先保证核心链路跑通，不要过度开发非核心功能。
2. 开发阶段默认使用 mock 模式，不要默认调用真实 API。
3. 正式体验阶段通过 .env 切换，不要删除成本控制机制。
4. 正式体验时关闭 mock、开启自动语音、隐藏 Dev Controls。
5. 正式体验时继续保留 TTS 缓存、上下文轮数限制和回复长度限制。
6. 不要为了效果加入太多复杂依赖。
7. 不要把代码写成一个超大的 App.tsx。
8. 组件、hooks、API service、prompt、types 要拆分清楚。
9. 任何 API Key 都不能写死在前端。
10. 如果真实 API 暂时无法测试，可以使用 mock 模式，但必须保留真实 API 接口结构。
11. Codra 的视觉要克制、高级、安静，不要做成普通 chatbot。
12. 语音只播放英文，不播放中文翻译。
13. 音乐功能只做推荐和 Apple Music 搜索跳转。
14. 保持项目可迁移性，方便后续复用到其他项目。
