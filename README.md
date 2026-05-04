# xhs-video

> **An [Agent Skill](https://agentskills.io) that lets your AI assistant download Xiaohongshu (小红书 / RedNote) videos for you.** Just paste a link and ask. Works in Claude Code, Codex, Amp, Cursor, Copilot, Cline, Windsurf, and 30+ more.

Under the hood it's a small Node + ffmpeg CLI, so you can also run it directly from your terminal if you prefer.

[中文文档 ↓](#中文文档)

---

## Why a Skill?

Modern AI coding agents (Claude Code, Codex, Amp, etc.) read `SKILL.md` files to learn new capabilities. Once this skill is installed, your agent automatically knows:

- That a Xiaohongshu link can be turned into an MP4
- How to call the included script with the right flags
- When to add `--mp3` for audio
- What to do when `node` or `ffmpeg` is missing

You don't memorize commands. You say *"download this xhs video"* and the agent handles it.

## Install (one command)

```bash
npx skills add hqman/xhs-video
```

That's it. The [`skills`](https://www.npmjs.com/package/skills) CLI fetches this repo and installs `SKILL.md` into the right directory for every agent on your machine.

Target a specific agent:

```bash
npx skills add hqman/xhs-video --agent claude-code
npx skills add hqman/xhs-video --agent codex
```

Install globally (user-level, all projects):

```bash
npx skills add hqman/xhs-video -g
```

Manual install:

```bash
# Claude Code
git clone https://github.com/hqman/xhs-video.git ~/.claude/skills/xhs-video

# Amp / Codex (per-workspace)
git clone https://github.com/hqman/xhs-video.git .agents/skills/xhs-video
```

## Use it inside your agent

After install, just talk to your agent normally:

> "Download this xhs video: https://www.xiaohongshu.com/explore/..."

> "Grab the audio from this 小红书 link as mp3"

The agent picks up the skill, runs the script, and saves the file. No flags to remember.

## Skill features

- Parses Xiaohongshu share / explore links and resolves the direct CDN MP4 URL
- Saves an MP4 by default; pass `--mp3` to also extract audio
- Preflight checks for `node` and `ffmpeg` with platform-specific install hints (no silent system mutation)
- No browser automation, no API key, no login

## What's in this repo

```
xhs-video/
├── SKILL.md            ← the skill definition (what your agent reads)
└── scripts/
    ├── xhs-video       ← bash entry, checks node and execs the parser
    ├── xhs-video.mjs   ← parser + KuKuTool handshake (Node 18+)
    └── xhs-media.sh    ← ffmpeg download + optional MP3 extraction
```

## Requirements

- **Node.js** 18+ (built-in `fetch` and `getSetCookie`)
- **ffmpeg** (only when downloading from a URL or extracting MP3)

If either is missing, the CLI prints the install command for your OS and exits cleanly.

## Direct CLI usage (optional)

You can also run the included script without an agent:

```bash
git clone https://github.com/hqman/xhs-video.git
cd xhs-video
chmod +x scripts/xhs-video scripts/xhs-media.sh

# MP4 only (default)
scripts/xhs-video "<xiaohongshu-url>"

# Specify output base path (no extension)
scripts/xhs-video "<xiaohongshu-url>" "/path/to/output-name"

# Also extract an MP3
scripts/xhs-video --mp3 "<xiaohongshu-url>" "/path/to/output-name"
```

Outputs:

- `<output-base>.mp4`
- `<output-base>.mp3` (only when `--mp3` is passed)

## How it works

The skill calls KuKuTool's public Xiaohongshu parser, performs the AES handshake it expects, and returns the direct CDN MP4 URL. `ffmpeg` then fetches and (optionally) re-encodes to MP3. If KuKuTool changes its protocol or shows a captcha, the skill fails loudly. Open an issue if that happens.

## License

MIT © [hqman](https://github.com/hqman)

---

## 中文文档

> **这是一个 [Agent Skill](https://agentskills.io)，让你的 AI 助手帮你下载小红书视频。** 把链接发过去说一声就行。支持 Claude Code、Codex、Amp、Cursor、Copilot、Cline、Windsurf 等 30+ agent。

底层是一个 Node + ffmpeg 的小工具，你也可以脱离 agent 直接命令行用。

### 为什么做成 Skill？

现在的 AI coding agent（Claude Code / Codex / Amp 等）会自动读取 `SKILL.md` 来学新能力。装上这个 skill 后，agent 自动知道：

- 小红书链接可以转成 MP4
- 怎么调用脚本、传哪些参数
- 什么时候该加 `--mp3` 出音频
- 缺 `node` 或 `ffmpeg` 怎么提示用户

你不用记命令，直接说"帮我下这个小红书视频"就完事。

### 一行安装

```bash
npx skills add hqman/xhs-video
```

就这一句。[`skills`](https://www.npmjs.com/package/skills) CLI 会自动把 `SKILL.md` 装到你机器上每个 agent 对应的目录里。

只装到某个特定 agent：

```bash
npx skills add hqman/xhs-video --agent claude-code
npx skills add hqman/xhs-video --agent codex
```

全局安装（用户级，所有项目共用）：

```bash
npx skills add hqman/xhs-video -g
```

手动安装：

```bash
# Claude Code
git clone https://github.com/hqman/xhs-video.git ~/.claude/skills/xhs-video

# Amp / Codex (项目级)
git clone https://github.com/hqman/xhs-video.git .agents/skills/xhs-video
```

### 在 agent 里使用

装完之后正常跟 agent 对话就行：

> "帮我下这个小红书视频: https://www.xiaohongshu.com/explore/..."

> "把这个 xhs 链接的音频提出来给我个 mp3"

agent 会自动调用这个 skill 完成下载，不用你记参数。

### Skill 功能

- 解析小红书分享/笔记链接，拿到 CDN 直链 MP4
- 默认只下 MP4；加 `--mp3` 同时导出音频
- 启动时检查 `node` 和 `ffmpeg`，缺啥提示装啥（不会偷偷改你系统）
- 不依赖浏览器自动化，不需要 API key 或登录

### 仓库结构

```
xhs-video/
├── SKILL.md            ← skill 定义（agent 会读这个）
└── scripts/
    ├── xhs-video       ← bash 入口，检查 node 后调用解析器
    ├── xhs-video.mjs   ← 解析器 + KuKuTool 握手（Node 18+）
    └── xhs-media.sh    ← ffmpeg 下载 + 可选 MP3 提取
```

### 环境要求

- **Node.js** 18+
- **ffmpeg**（只在下载远程 URL 或导出 MP3 时才需要）

缺少时 CLI 会打印对应平台的安装命令并干净退出。

### 直接命令行使用（可选）

不通过 agent 也能直接跑脚本：

```bash
git clone https://github.com/hqman/xhs-video.git
cd xhs-video
chmod +x scripts/xhs-video scripts/xhs-media.sh

# 默认只下 MP4
scripts/xhs-video "<小红书链接>"

# 指定输出路径（不带扩展名）
scripts/xhs-video "<小红书链接>" "/path/to/output-name"

# 同时导出 MP3
scripts/xhs-video --mp3 "<小红书链接>" "/path/to/output-name"
```

输出文件：

- `<output-base>.mp4`
- `<output-base>.mp3`（仅在加 `--mp3` 时生成）

### 工作原理

Skill 调用 KuKuTool 公开的小红书解析接口，按它要求做 AES 握手，拿到 CDN 直链 MP4，再由 `ffmpeg` 完成下载和可选的 MP3 转码。KuKuTool 改协议或者出验证码时 skill 会直接报错，欢迎提 issue。

### License

MIT © [hqman](https://github.com/hqman)
