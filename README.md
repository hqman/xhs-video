# xhs-video

Download Xiaohongshu (小红书) videos to MP4 from the command line. Optionally extract an MP3 audio track.

Works as a standalone CLI **and** as an agent skill (Claude Code / Amp / Codex / any tool that supports the `SKILL.md` format).

## Features

- Parse a Xiaohongshu share/explore link and pull the direct MP4 URL
- Save the video to a chosen output path
- Optional `--mp3` flag to also extract an MP3
- Preflight checks for `node` and `ffmpeg` with platform-specific install hints
- No browser automation, no API key

## Requirements

- **Node.js** 18+ (for built-in `fetch` and `getSetCookie`)
- **ffmpeg** (only required when downloading from a URL or extracting MP3)

If either is missing, the CLI prints the install command for your OS and exits.

## Install

### As an agent skill

```bash
npx skills add hqman/xhs-video
```

This drops the skill into your local agent skills directory (Claude Code, Amp, Codex, etc.).

Or install manually:

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

## How it works

The CLI talks to KuKuTool's public Xiaohongshu parser endpoint, performs the AES handshake it expects, and returns the direct CDN MP4 URL. `ffmpeg` then fetches and (optionally) re-encodes to MP3.

If KuKuTool changes its protocol or shows a captcha, the CLI fails loudly. Open an issue if that happens.

## License

MIT © [hqman](https://github.com/hqman)
