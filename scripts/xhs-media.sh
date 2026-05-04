#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  xhs-media.sh [--mp3] <source> [output-base]

Options:
  --mp3            Also extract an MP3 audio file. Off by default.

source:
  A local .mp4 file or a direct mp4 URL.

output-base:
  Optional base path without extension.
  Defaults to the source path without the .mp4 suffix when source is a file.

Outputs:
  <output-base>.mp4
  <output-base>.mp3   (only when --mp3 is passed)
EOF
}

extract_mp3=0
positional=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mp3)
      extract_mp3=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        positional+=("$1")
        shift
      done
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
    *)
      positional+=("$1")
      shift
      ;;
  esac
done

if [[ ${#positional[@]} -lt 1 ]]; then
  usage
  exit 1
fi

source_input="${positional[0]}"
output_base="${positional[1]:-}"

if [[ -z "$output_base" ]]; then
  if [[ "$source_input" =~ ^https?:// ]]; then
    output_base="xhs-video"
  else
    output_base="${source_input%.*}"
  fi
fi

mp4_path="${output_base}.mp4"
mp3_path="${output_base}.mp3"

install_hint_ffmpeg() {
  case "$(uname -s)" in
    Darwin) echo "  brew install ffmpeg" ;;
    Linux)
      echo "  sudo apt install -y ffmpeg   # Debian/Ubuntu"
      echo "  sudo dnf install -y ffmpeg   # Fedora"
      echo "  sudo pacman -S ffmpeg        # Arch"
      ;;
    *) echo "  winget install Gyan.FFmpeg" ;;
  esac
}

require_ffmpeg() {
  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "Error: 'ffmpeg' is not installed or not on PATH." >&2
    echo "Install it with:" >&2
    install_hint_ffmpeg >&2
    exit 127
  fi
}

if [[ "$source_input" =~ ^https?:// ]]; then
  require_ffmpeg
  ffmpeg -y -i "$source_input" -c copy "$mp4_path"
else
  cp "$source_input" "$mp4_path"
fi

if [[ "$extract_mp3" -eq 1 ]]; then
  require_ffmpeg
  ffmpeg -y -i "$mp4_path" -vn -codec:a libmp3lame -q:a 2 "$mp3_path"
  printf '%s\n%s\n' "$mp4_path" "$mp3_path"
else
  printf '%s\n' "$mp4_path"
fi
