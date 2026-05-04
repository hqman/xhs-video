# xhs-video

> Download Xiaohongshu (小红书 / RedNote) videos to MP4 from the command line. Optionally extract an MP3 audio track.

Works as a standalone CLI **and** as an agent skill (Claude Code, Amp, Cursor, Codex, Copilot, and any other tool that supports the [Agent Skills](https://agentskills.io) standard).

[中文文档 ↓](#中文文档)

---

## Features

- Parse a Xiaohongshu share/explore link and pull the direct MP4 URL
- Save the video to a chosen output path
- Optional `--mp3` flag to also extract an MP3
- Preflight checks for `node` and `ffmpeg` with platform-specific install hints
- No browser automation, no API key

## Requirements

- **Node.js** 18+ (for built-in `fetch` and `getSetCookie`)
- **ffmpeg** (only required when downloading from a URL or extracting MP3)

If either is missing, the CLI prints the install command for your OS and exits cleanly.

## Install

### As an agent skill (recommended)

One command installs the skill into all supported AI agents:

```bash
npx skills add hqman/xhs-video
```

This uses the [`skills`](https://www.npmjs.com/package/skills) CLI, which fetches the `SKILL.md` from this repo and installs it into the right directory for Claude Code, Cursor, Copilot, Amp, Codex, Cline, Windsurf, and 30+ others.

Target a specific agent only:

```bash
npx skills add hqman/xhs-video --agent claude-code
npx skills add hqman/xhs-video --agent codex
```

Install globally (user-level, all projects):

```bash
npx skills add hqman/xhs-video -g
```

### Manual install

```bash
# Claude Code
git clone https://github.com/hqman/xhs-video.git ~/.claude/skills/xhs-video

# Amp / Codex (per-workspace)
git clone https://github.com/hqman/xhs-video.git .agents/skills/xhs-video
```

### As a standalone CLI

```bash
git clone https://github.com/hqman/xhs-video.git
cd xhs-video
chmod +x scripts/xhs-video scripts/xhs-media.sh

# Optional: put it on your PATH
ln -s "$(pwd)/scripts/xhs-video" /usr/local/bin/xhs-video
```

## Usage

```bash
# MP4 only (default)
scripts/xhs-video "<xiaohongshu-url>"

# Specify output base path (no extension)
scripts/xhs-video "<xiaohongshu-url>" "/path/to/output-name"

# Also extract an MP3 audio file
scripts/xhs-video --mp3 "<xiaohongshu-url>" "/path/to/output-name"
```

Outputs:

- `<output-base>.mp4`
- `<output-base>.mp3` (only when `--mp3` is passed)

If `output-base` is omitted, the note title is used (sanitized, in current dir), or `xhs-video` as a fallback.

### Using inside an AI agent

After installing the skill, just paste a Xiaohongshu link to your agent and ask it to download the video. The agent will pick up this skill automatically. Add "with mp3" if you also want audio.

## How it works

The CLI talks to KuKuTool's public Xiaohongshu parser endpoint, performs the AES handshake it expects, and returns the direct CDN MP4 URL. `ffmpeg` then fetches and (optionally) re-encodes to MP3.

If KuKuTool changes its protocol or shows a captcha, the CLI fails loudly. Open an issue if that happens.

## License

MIT © [hqman](https://github.com/hqman)

---

## 中文文档

> 命令行下载小红书视频 (MP4)，按需附带提取 MP3 音频。

既可以作为独立 CLI 使用，也可以作为 AI agent 的 skill（Claude Code / Cursor / Copilot / Amp / Codex / Cline / Windsurf 等都支持）。

### 功能特点

- 解析小红书分享/笔记链接，拿到直链 MP4
- 保存视频到指定路径
- 可选 `--mp3` 参数顺便导出 MP3
- 启动时自动检查 `node` 和 `ffmpeg`，缺啥提示装啥
- 不依赖浏览器自动化，不需要 API key

### 环境要求

- **Node.js** 18+
- **ffmpeg**（只在下载远程 URL 或导出 MP3 时才需要）

缺少时 CLI 会打印对应平台的安装命令并退出，不会乱搞你的系统。

### 安装

#### 作为 AI agent skill（推荐）

一行命令装到所有支持的 agent 里：

```bash
npx skills add hqman/xhs-video
```

这用的是 [`skills`](https://www.npmjs.com/package/skills) CLI，会自动把 `SKILL.md` 装到 Claude Code、Cursor、Copilot、Amp、Codex、Cline、Windsurf 等几十个 agent 的对应目录下。

只装到某个特定 agent：

```bash
npx skills add hqman/xhs-video --agent claude-code
npx skills add hqman/xhs-video --agent codex
```

全局安装（用户级，所有项目共用）：

```bash
npx skills add hqman/xhs-video -g
```

#### 手动安装

```bash
# Claude Code
git clone https://github.com/hqman/xhs-video.git ~/.claude/skills/xhs-video

# Amp / Codex (项目级)
git clone https://github.com/hqman/xhs-video.git .agents/skills/xhs-video
```

#### 作为独立 CLI

```bash
git clone https://github.com/hqman/xhs-video.git
cd xhs-video
chmod +x scripts/xhs-video scripts/xhs-media.sh

# 可选：加到 PATH
ln -s "$(pwd)/scripts/xhs-video" /usr/local/bin/xhs-video
```

### 使用方法

```bash
# 默认只下 MP4
scripts/xhs-video "<小红书链接>"

# 指定输出路径（不带扩展名）
scripts/xhs-video "<小红书链接>" "/path/to/output-name"

# 同时导出 MP3 音频
scripts/xhs-video --mp3 "<小红书链接>" "/path/to/output-name"
```

输出文件：

- `<output-base>.mp4`
- `<output-base>.mp3`（仅在加 `--mp3` 时生成）

不指定 `output-base` 时，会用笔记标题（清洗后）保存到当前目录，没有标题则 fallback 到 `xhs-video`。

### 在 AI agent 里使用

装完 skill 后，直接把小红书链接发给你的 AI agent，让它下载视频就行，agent 会自动调用这个 skill。需要音频就加一句"也要 mp3"。

### 工作原理

CLI 调用 KuKuTool 公开的小红书解析接口，按它要求做 AES 握手，拿到 CDN 直链 MP4。然后由 `ffmpeg` 完成下载和（可选的）MP3 转码。

如果 KuKuTool 改了协议或者出了验证码，CLI 会直接报错退出，欢迎提 issue。

### License

MIT © [hqman](https://github.com/hqman)
