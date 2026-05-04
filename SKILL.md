---
name: xhs-video
description: "Use when the user gives a Xiaohongshu link and wants the downloadable MP4 (and optionally an MP3 audio track). Open KuKuTool's Xiaohongshu parser, submit the link, capture the direct video URL or downloaded MP4, then save the MP4. Pass --mp3 to also extract an MP3."
---

# XHS Video

Download a Xiaohongshu video through KuKuTool. By default only the MP4 is saved. Pass `--mp3` to also extract an MP3 from the saved MP4.

## CLI

Prefer the CLI when the user wants the MP4 without opening a browser:

```bash
.claude/skills/xhs-video/scripts/xhs-video "<xiaohongshu-url>" "/Users/hqman/Downloads/output-name"
```

Add `--mp3` when the user explicitly asks for an audio file:

```bash
.claude/skills/xhs-video/scripts/xhs-video --mp3 "<xiaohongshu-url>" "/Users/hqman/Downloads/output-name"
```

The output-base argument is optional. It is a path without extension. The CLI creates:

- `<output-base>.mp4`
- `<output-base>.mp3` (only when `--mp3` is passed)

## Workflow

1. Open `https://dy.kukutool.com/xiaohongshu`.
2. Paste the Xiaohongshu link into the input.
3. Click `开始解析`.
4. Wait until the video section appears.
5. Prefer the `下载 正常` button unless the user asks for ultra HD.
6. Save the MP4 as `<title>.mp4` in the user's chosen folder, or `xhs-video.mp4` if no title is available.
7. Only run `scripts/xhs-media.sh --mp3` on the MP4 to generate an MP3 when the user explicitly asks for audio.

## Notes

- Default behavior is video-only. Do not generate MP3 unless the user asks for it or passes `--mp3`.
- When automating the browser, use real typing or clipboard paste for the input. A direct form fill may not sync with the site's frontend state.
- If the page exposes a direct `sns-video-hw.xhscdn.com` MP4 URL, use that URL as the source for the local download.
- If KuKuTool shows a captcha, login wall, or parse failure, stop and ask the user.
- Keep file names simple and stable. Reuse the note title when possible.
