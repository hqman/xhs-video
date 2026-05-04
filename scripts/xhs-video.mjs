#!/usr/bin/env node
import { createCipheriv, createDecipheriv, createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = "https://dy.kukutool.com";
const PROFILE = {
  authRoute: "auth-25e532",
  authResponseFields: { key: "k_25e532", seed: "s_25e532" },
  parseRequestFields: {
    key: "k_25e532",
    payload: "p_25e532",
    iv: "i_25e532",
    version: "r_25e532",
  },
};
const RESPONSE_KEY = "12345678901234567890123456789013";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";

function usage() {
  console.log(`Usage:
  xhs-video.mjs [--mp3] <xiaohongshu-url> [output-base]

Options:
  --mp3            Also extract an MP3 audio file. Off by default.

Examples:
  xhs-video.mjs "https://www.xiaohongshu.com/explore/..."
  xhs-video.mjs "https://www.xiaohongshu.com/explore/..." "/Users/hqman/Downloads/my-video"
  xhs-video.mjs --mp3 "https://www.xiaohongshu.com/explore/..."
`);
}

function parseArgs(argv) {
  const positional = [];
  let extractMp3 = false;
  let help = false;
  for (const arg of argv) {
    if (arg === "--mp3") {
      extractMp3 = true;
    } else if (arg === "-h" || arg === "--help") {
      help = true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, extractMp3, help };
}

function cookieHeaderFrom(response) {
  const setCookie = response.headers.getSetCookie?.() || [];
  return setCookie.map((cookie) => cookie.split(";")[0]).join("; ");
}

function mergeCookies(current, response) {
  const jar = new Map();
  for (const cookie of current.split(";").map((item) => item.trim()).filter(Boolean)) {
    const index = cookie.indexOf("=");
    if (index > 0) jar.set(cookie.slice(0, index), cookie.slice(index + 1));
  }
  const setCookie = response.headers.getSetCookie?.() || [];
  for (const cookie of setCookie) {
    const pair = cookie.split(";")[0];
    const index = pair.indexOf("=");
    if (index > 0) jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
  return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 200)}`);
  }
  return { response, json };
}

async function getSessionCookie() {
  const response = await fetch(`${BASE_URL}/xiaohongshu`, {
    headers: { "user-agent": USER_AGENT },
  });
  return cookieHeaderFrom(response);
}

async function getAuth(sourceUrl, cookie) {
  const { response, json } = await requestJson(`${BASE_URL}/api/${PROFILE.authRoute}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": USER_AGENT,
      referer: `${BASE_URL}/xiaohongshu`,
      origin: BASE_URL,
      cookie,
    },
    body: JSON.stringify({
      requestURL: sourceUrl,
      pagePath: "/xiaohongshu",
      mode: "single",
    }),
  });

  if (!response.ok) {
    throw new Error(`Auth failed: HTTP ${response.status} ${JSON.stringify(json)}`);
  }

  return {
    authKey: json[PROFILE.authResponseFields.key],
    authSeed: json[PROFILE.authResponseFields.seed],
    cookie: mergeCookies(cookie, response),
  };
}

function toBase64(buffer) {
  return Buffer.from(buffer).toString("base64");
}

function encryptParseParams(params, auth) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = createHash("sha256").update(`${auth.authKey}:${auth.authSeed}`).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(params), "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  return {
    version: 3,
    [PROFILE.parseRequestFields.key]: auth.authKey,
    [PROFILE.parseRequestFields.payload]: toBase64(ciphertext),
    [PROFILE.parseRequestFields.version]: 1,
    [PROFILE.parseRequestFields.iv]: toBase64(iv),
  };
}

async function parseXhs(sourceUrl, cookie) {
  const auth = await getAuth(sourceUrl, cookie);
  const body = encryptParseParams(
    {
      requestURL: sourceUrl,
      captchaKey: "",
      captchaInput: "",
      totalSuccessCount: "0",
      successCount: "0",
      firstSuccessDate: "",
      pagePath: "/xiaohongshu",
      isMobile: "false",
      geoipIp: "",
    },
    auth,
  );

  const { response, json } = await requestJson(`${BASE_URL}/api/parse`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": USER_AGENT,
      referer: `${BASE_URL}/xiaohongshu`,
      origin: BASE_URL,
      cookie: auth.cookie,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Parse failed: HTTP ${response.status} ${JSON.stringify(json)}`);
  }
  if (json.status !== 0) {
    throw new Error(`Parse failed: ${json.message || JSON.stringify(json)}`);
  }
  return json.encrypt ? decryptResponse(json.data, json.iv) : json.data;
}

const STANDARD_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CUSTOM_B64 = "ZYXABCDEFGHIJKLMNOPQRSTUVWzyxabcdefghijklmnopqrstuvw9876543210-_";
const XOR_KEY = 0x5a;

function base64CustomDecode(value) {
  return value
    .split("")
    .map((char) => {
      const index = CUSTOM_B64.indexOf(char);
      return index === -1 ? char : STANDARD_B64[index];
    })
    .join("");
}

function blockReverse(value, blockSize = 8) {
  let result = "";
  for (let i = 0; i < value.length; i += blockSize) {
    result += value.slice(i, i + blockSize).split("").reverse().join("");
  }
  return result;
}

function xorString(value, key = XOR_KEY) {
  let result = "";
  for (let i = 0; i < value.length; i += 1) {
    result += String.fromCharCode(value.charCodeAt(i) ^ key);
  }
  return result;
}

function decryptResponse(encryptedData, encryptedIv) {
  let data = xorString(encryptedData);
  let iv = xorString(encryptedIv);
  data = blockReverse(data);
  iv = blockReverse(iv);
  data = base64CustomDecode(data);
  iv = base64CustomDecode(iv);

  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(RESPONSE_KEY, "utf8"),
    Buffer.from(iv, "base64"),
  );
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(data, "base64")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(plaintext);
}

function selectVideo(data) {
  const first = data?.videos?.[0];
  if (!first) {
    throw new Error("No video found in parse result.");
  }
  if (typeof first === "string") {
    return first;
  }
  const normal =
    first.video_fullinfo?.find((item) => item.type?.includes("正常")) ||
    first.video_fullinfo?.[0];
  return normal?.url || first.url;
}

function sanitizeFilename(value) {
  return String(value || "xhs-video")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 64)
    .replace(/^_+|_+$/g, "") || "xhs-video";
}

function runMediaScript(videoUrl, outputBase, extractMp3) {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const mediaScript = resolve(scriptDir, "xhs-media.sh");
  const args = [];
  if (extractMp3) args.push("--mp3");
  args.push(videoUrl, outputBase);
  const result = spawnSync(mediaScript, args, {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Media script failed with exit code ${result.status}`);
  }
}

async function main() {
  const { positional, extractMp3, help } = parseArgs(process.argv.slice(2));
  const [sourceUrl, outputBaseArg] = positional;
  if (help || !sourceUrl) {
    usage();
    process.exit(sourceUrl || help ? 0 : 1);
  }

  const cookie = await getSessionCookie();
  const data = await parseXhs(sourceUrl, cookie);
  const videoUrl = selectVideo(data);
  const outputBase =
    outputBaseArg ||
    resolve(process.cwd(), sanitizeFilename(data.title || "xhs-video"));

  console.log(`title: ${data.title || "(untitled)"}`);
  console.log(`video: ${videoUrl}`);
  runMediaScript(videoUrl, outputBase, extractMp3);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
