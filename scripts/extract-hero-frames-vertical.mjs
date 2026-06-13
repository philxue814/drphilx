import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "hero", "frames-vertical");
const defaultVideo = path.join(ROOT, "vertical hero.mp4");
const video = process.argv[2] || defaultVideo;

if (!fs.existsSync(video)) {
  console.error("Video not found:", video);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

for (const file of fs.readdirSync(OUT)) {
  if (file.startsWith("frame_")) fs.unlinkSync(path.join(OUT, file));
}

// Exact 24fps frames, upscaled to 1080px width (height follows aspect ~1952)
const vf = [
  "fps=24",
  "scale=1080:-2:flags=lanczos+accurate_rnd+full_chroma_int",
  "unsharp=7:7:0.65:7:7:0.0",
].join(",");

console.log("Extracting vertical hero frames (1080w) from", path.basename(video));
execSync(
  [
    "ffmpeg -y",
    `-i "${video}"`,
    `-vf "${vf}"`,
    "-q:v 2",
    `"${path.join(OUT, "frame_%04d.jpg")}"`,
  ].join(" "),
  { stdio: "inherit", cwd: ROOT }
);

const frames = fs.readdirSync(OUT).filter((f) => f.endsWith(".jpg"));
const bytes = frames.reduce(
  (sum, f) => sum + fs.statSync(path.join(OUT, f)).size,
  0
);

const sample = frames[0];
let dimensions = "";
if (sample) {
  try {
    const probe = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${path.join(OUT, sample)}"`,
      { encoding: "utf8", cwd: ROOT }
    ).trim();
    dimensions = ` (${probe.replace(",", "x")})`;
  } catch {
    /* optional */
  }
}

console.log(
  `\n${frames.length} frames in public/hero/frames-vertical/${dimensions} — ${(bytes / 1024 / 1024).toFixed(1)} MB`
);